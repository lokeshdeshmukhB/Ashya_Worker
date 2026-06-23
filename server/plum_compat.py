"""
Compatibility shim for old fastai .pkl models that reference deprecated plum/fasttransform modules.
Import this BEFORE importing fastai or torch.load on a saved learner.

Strategy:
  - Pre-register all known-missing submodules in sys.modules so pickle's find_class()
    resolves them instantly (sys.modules lookup happens before import machinery).
  - Use a modern find_spec() finder appended to END of sys.meta_path as a catch-all
    fallback ONLY for plum.* and fasttransform.* that are still missing.
"""
import sys
import types
import importlib.util
import importlib.abc
import importlib.machinery


# ── Picklable stub class ─────────────────────────────────────────────────────
# Must be defined at module scope so pickle can find them by name.

class _Stub(list):
    """Picklable no-op stub for any class the old model pickle references.
    Subclasses list so that list-like stubs (MethodList etc.) work correctly."""
    def __init__(self, *args, **kwargs):
        super().__init__()

    def __call__(self, *args, **kwargs):
        return _Stub()

    def __repr__(self):
        return f"<Stub {self.__class__.__name__}>"

    def __reduce__(self):
        return (_make_stub, (self.__class__.__name__,))


def _make_stub(name):
    """Pickle helper – reconstitutes a named stub."""
    return _Stub()


def _make_stub_class(name, module):
    """Create a uniquely-named stub class registered in sys.modules so pickle finds it."""
    cls = type(name, (_Stub,), {
        '__module__': module,
        '__qualname__': name,
        '__reduce__': lambda self: (_make_stub, (name,)),
    })
    return cls


# ── Generic stub module ──────────────────────────────────────────────────────

class _StubModule(types.ModuleType):
    """A fake module whose every attribute returns a stub class."""

    def __init__(self, fullname):
        super().__init__(fullname)
        self.__file__ = __file__
        self.__loader__ = None
        self.__package__ = fullname.rsplit('.', 1)[0] if '.' in fullname else fullname
        self.__path__ = []          # marks this as a "package" so sub-imports work
        self.__spec__ = None
        self._stub_cache = {}

    def __getattr__(self, name):
        if name.startswith('__'):
            raise AttributeError(name)
        if name not in self._stub_cache:
            self._stub_cache[name] = _make_stub_class(name, self.__name__)
        return self._stub_cache[name]


# ── Finder / Loader ──────────────────────────────────────────────────────────

class _StubLoader(importlib.abc.Loader):
    def create_module(self, spec):
        return _StubModule(spec.name)

    def exec_module(self, module):
        pass  # nothing to execute


_loader = _StubLoader()

_STUB_PREFIXES = ('plum', 'fasttransform')


class _StubFinder(importlib.abc.MetaPathFinder):
    """Fallback finder: only triggered when every other finder has given up."""

    def find_spec(self, fullname, path, target=None):
        if not any(fullname == p or fullname.startswith(p + '.') for p in _STUB_PREFIXES):
            return None
        return importlib.machinery.ModuleSpec(fullname, _loader, is_package=True)


# ── Known submodules that old fastai pickles reference ───────────────────────
_KNOWN_MODULES = [
    'plum',
    'plum.resolver',
    'plum.method',
    'plum.function',
    'plum.signature',
    'plum.dispatcher',
    'plum.type',
    'plum.util',
    'plum.parametric',
    'plum.promotion',
    'plum.resolvable',
    'plum.overload',
    'plum.dispatch',
    'fasttransform',
    'fasttransform.cast',
    'fasttransform.transform',
    'fasttransform.core',
]

# Extra stub class names per module that old pickle files might request
_MODULE_CLASSES = {
    'plum.resolver':   ['Resolver'],
    'plum.method':     ['Method', 'MethodList'],
    'plum.function':   ['Function', 'Resolver'],
    'plum.signature':  ['Signature'],
    'plum.dispatcher': ['Dispatcher'],
    'plum.type':       ['TypeMeta'],
    'plum':            ['Resolver', 'Function', 'Method', 'dispatch'],
}


def install():
    """Register all stub modules. Call once, before importing fastai."""

    # 1. Append catch-all finder at the very END (lowest priority)
    if not any(isinstance(f, _StubFinder) for f in sys.meta_path):
        sys.meta_path.append(_StubFinder())

    # 2. Pre-populate sys.modules for all known modules
    for mod_name in _KNOWN_MODULES:
        if mod_name not in sys.modules:
            mod = _StubModule(mod_name)
            sys.modules[mod_name] = mod

    # 3. Populate well-known classes inside each module
    for mod_name, class_names in _MODULE_CLASSES.items():
        mod = sys.modules.get(mod_name)
        if mod is not None:
            for cls_name in class_names:
                if not hasattr(mod, cls_name):
                    setattr(mod, cls_name, _make_stub_class(cls_name, mod_name))

    # 4. Wire up parent.child references so `import plum.resolver` works
    for mod_name in _KNOWN_MODULES:
        if '.' in mod_name:
            parent_name, child_attr = mod_name.rsplit('.', 1)
            parent = sys.modules.get(parent_name)
            child = sys.modules.get(mod_name)
            if parent is not None and child is not None:
                if not hasattr(parent, child_attr):
                    setattr(parent, child_attr, child)


install()
