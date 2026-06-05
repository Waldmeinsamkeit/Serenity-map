var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __knownSymbol = (name, symbol) => (symbol = Symbol[name]) ? symbol : Symbol.for("Symbol." + name);
var __typeError = (msg) => {
  throw TypeError(msg);
};
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var __decoratorStart = (base) => [, , , __create(base?.[__knownSymbol("metadata")] ?? null)];
var __decoratorStrings = ["class", "method", "getter", "setter", "accessor", "field", "value", "get", "set"];
var __expectFn = (fn) => fn !== void 0 && typeof fn !== "function" ? __typeError("Function expected") : fn;
var __decoratorContext = (kind, name, done, metadata, fns) => ({ kind: __decoratorStrings[kind], name, metadata, addInitializer: (fn) => done._ ? __typeError("Already initialized") : fns.push(__expectFn(fn || null)) });
var __decoratorMetadata = (array, target) => __defNormalProp(target, __knownSymbol("metadata"), array[3]);
var __runInitializers = (array, flags, self, value) => {
  for (var i = 0, fns = array[flags >> 1], n = fns && fns.length; i < n; i++) flags & 1 ? fns[i].call(self) : value = fns[i].call(self, value);
  return value;
};
var __decorateElement = (array, flags, name, decorators, target, extra) => {
  var fn, it, done, ctx, access, k = flags & 7, s = !!(flags & 8), p = !!(flags & 16);
  var j = k > 3 ? array.length + 1 : k ? s ? 1 : 2 : 0, key = __decoratorStrings[k + 5];
  var initializers = k > 3 && (array[j - 1] = []), extraInitializers = array[j] || (array[j] = []);
  var desc = k && (!p && !s && (target = target.prototype), k < 5 && (k > 3 || !p) && __getOwnPropDesc(k < 4 ? target : { get [name]() {
    return __privateGet(this, extra);
  }, set [name](x) {
    return __privateSet(this, extra, x);
  } }, name));
  k ? p && k < 4 && __name(extra, (k > 2 ? "set " : k > 1 ? "get " : "") + name) : __name(target, name);
  for (var i = decorators.length - 1; i >= 0; i--) {
    ctx = __decoratorContext(k, name, done = {}, array[3], extraInitializers);
    if (k) {
      ctx.static = s, ctx.private = p, access = ctx.access = { has: p ? (x) => __privateIn(target, x) : (x) => name in x };
      if (k ^ 3) access.get = p ? (x) => (k ^ 1 ? __privateGet : __privateMethod)(x, target, k ^ 4 ? extra : desc.get) : (x) => x[name];
      if (k > 2) access.set = p ? (x, y) => __privateSet(x, target, y, k ^ 4 ? extra : desc.set) : (x, y) => x[name] = y;
    }
    it = (0, decorators[i])(k ? k < 4 ? p ? extra : desc[key] : k > 4 ? void 0 : { get: desc.get, set: desc.set } : target, ctx), done._ = 1;
    if (k ^ 4 || it === void 0) __expectFn(it) && (k > 4 ? initializers.unshift(it) : k ? p ? extra = it : desc[key] = it : target = it);
    else if (typeof it !== "object" || it === null) __typeError("Object expected");
    else __expectFn(fn = it.get) && (desc.get = fn), __expectFn(fn = it.set) && (desc.set = fn), __expectFn(fn = it.init) && initializers.unshift(fn);
  }
  return k || __decoratorMetadata(array, target), desc && __defProp(target, name, desc), p ? k ^ 4 ? extra : desc : target;
};
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
var __accessCheck = (obj, member, msg) => member.has(obj) || __typeError("Cannot " + msg);
var __privateIn = (member, obj) => Object(obj) !== obj ? __typeError('Cannot use the "in" operator on this value') : member.has(obj);
var __privateGet = (obj, member, getter) => (__accessCheck(obj, member, "read from private field"), getter ? getter.call(obj) : member.get(obj));
var __privateSet = (obj, member, value, setter) => (__accessCheck(obj, member, "write to private field"), setter ? setter.call(obj, value) : member.set(obj, value), value);
var __privateMethod = (obj, member, method) => (__accessCheck(obj, member, "access private method"), method);
var __getHasCollaborators_dec, _init;
import { atom, computed, unsafe__withoutCapture } from "@tldraw/state";
import { AtomSet } from "@tldraw/store";
import { TLINSTANCE_ID, TLPOINTER_ID } from "@tldraw/tlschema";
import { INTERNAL_POINTER_IDS } from "../../../constants.mjs";
import { Vec } from "../../../primitives/Vec.mjs";
import { isAccelKey } from "../../../utils/keyboard.mjs";
__getHasCollaborators_dec = [computed];
class InputsManager {
  constructor(editor) {
    this.editor = editor;
    __runInitializers(_init, 5, this);
    __publicField(this, "_originPagePoint", atom("originPagePoint", new Vec()));
    __publicField(this, "_originScreenPoint", atom("originScreenPoint", new Vec()));
    __publicField(this, "_previousPagePoint", atom("previousPagePoint", new Vec()));
    __publicField(this, "_previousScreenPoint", atom("previousScreenPoint", new Vec()));
    __publicField(this, "_currentPagePoint", atom("currentPagePoint", new Vec()));
    __publicField(this, "_currentScreenPoint", atom("currentScreenPoint", new Vec()));
    __publicField(this, "_pointerVelocity", atom("pointerVelocity", new Vec()));
    /**
     * A set containing the currently pressed keys.
     */
    __publicField(this, "keys", new AtomSet("keys"));
    /**
     * A set containing the currently pressed buttons.
     */
    __publicField(this, "buttons", new AtomSet("buttons"));
    __publicField(this, "_isPen", atom("isPen", false));
    __publicField(this, "_shiftKey", atom("shiftKey", false));
    __publicField(this, "_metaKey", atom("metaKey", false));
    __publicField(this, "_ctrlKey", atom("ctrlKey", false));
    __publicField(this, "_altKey", atom("altKey", false));
    __publicField(this, "_isDragging", atom("isDragging", false));
    __publicField(this, "_isPointing", atom("isPointing", false));
    __publicField(this, "_isPinching", atom("isPinching", false));
    __publicField(this, "_isEditing", atom("isEditing", false));
    __publicField(this, "_isPanning", atom("isPanning", false));
    __publicField(this, "_isSpacebarPanning", atom("isSpacebarPanning", false));
    /**
     * The previous point used for velocity calculation (updated each tick, not each pointer event).
     * @internal
     */
    __publicField(this, "_velocityPrevPoint", new Vec());
  }
  /**
   * The most recent pointer down's position in the current page space.
   */
  getOriginPagePoint() {
    return this._originPagePoint.get();
  }
  /**
   * @deprecated Use `getOriginPagePoint()` instead.
   */
  // eslint-disable-next-line no-restricted-syntax
  get originPagePoint() {
    return this.getOriginPagePoint();
  }
  /**
   * The most recent pointer down's position in screen space.
   */
  getOriginScreenPoint() {
    return this._originScreenPoint.get();
  }
  /**
   * @deprecated Use `getOriginScreenPoint()` instead.
   */
  // eslint-disable-next-line no-restricted-syntax
  get originScreenPoint() {
    return this.getOriginScreenPoint();
  }
  /**
   * The previous pointer position in the current page space.
   */
  getPreviousPagePoint() {
    return this._previousPagePoint.get();
  }
  /**
   * @deprecated Use `getPreviousPagePoint()` instead.
   */
  // eslint-disable-next-line no-restricted-syntax
  get previousPagePoint() {
    return this.getPreviousPagePoint();
  }
  /**
   * The previous pointer position in screen space.
   */
  getPreviousScreenPoint() {
    return this._previousScreenPoint.get();
  }
  /**
   * @deprecated Use `getPreviousScreenPoint()` instead.
   */
  // eslint-disable-next-line no-restricted-syntax
  get previousScreenPoint() {
    return this.getPreviousScreenPoint();
  }
  /**
   * The most recent pointer position in the current page space.
   */
  getCurrentPagePoint() {
    return this._currentPagePoint.get();
  }
  /**
   * @deprecated Use `getCurrentPagePoint()` instead.
   */
  // eslint-disable-next-line no-restricted-syntax
  get currentPagePoint() {
    return this.getCurrentPagePoint();
  }
  /**
   * The most recent pointer position in screen space.
   */
  getCurrentScreenPoint() {
    return this._currentScreenPoint.get();
  }
  /**
   * @deprecated Use `getCurrentScreenPoint()` instead.
   */
  // eslint-disable-next-line no-restricted-syntax
  get currentScreenPoint() {
    return this.getCurrentScreenPoint();
  }
  /**
   * Velocity of mouse pointer, in pixels per millisecond.
   */
  getPointerVelocity() {
    return this._pointerVelocity.get();
  }
  /**
   * @deprecated Use `getPointerVelocity()` instead.
   */
  // eslint-disable-next-line no-restricted-syntax
  get pointerVelocity() {
    return this.getPointerVelocity();
  }
  /**
   * Normally you shouldn't need to set the pointer velocity directly, this is set by the tick manager.
   * However, this is currently used in tests to fake pointer velocity.
   * @param pointerVelocity - The pointer velocity.
   * @internal
   */
  setPointerVelocity(pointerVelocity) {
    this._pointerVelocity.set(pointerVelocity);
  }
  /**
   * Whether the input is from a pen.
   */
  getIsPen() {
    return this._isPen.get();
  }
  /**
   * @deprecated Use `getIsPen()` instead.
   */
  // eslint-disable-next-line no-restricted-syntax
  get isPen() {
    return this.getIsPen();
  }
  // eslint-disable-next-line no-restricted-syntax
  set isPen(isPen) {
    this.setIsPen(isPen);
  }
  /**
   * @param isPen - Whether the input is from a pen.
   */
  setIsPen(isPen) {
    this._isPen.set(isPen);
  }
  /**
   * Whether the shift key is currently pressed.
   */
  getShiftKey() {
    return this._shiftKey.get();
  }
  /**
   * @deprecated Use `getShiftKey()` instead.
   */
  // eslint-disable-next-line no-restricted-syntax
  get shiftKey() {
    return this.getShiftKey();
  }
  // eslint-disable-next-line no-restricted-syntax
  set shiftKey(shiftKey) {
    this.setShiftKey(shiftKey);
  }
  /**
   * @param shiftKey - Whether the shift key is pressed.
   * @internal
   */
  setShiftKey(shiftKey) {
    this._shiftKey.set(shiftKey);
  }
  /**
   * Whether the meta key is currently pressed.
   */
  getMetaKey() {
    return this._metaKey.get();
  }
  /**
   * @deprecated Use `getMetaKey()` instead.
   */
  // eslint-disable-next-line no-restricted-syntax
  get metaKey() {
    return this.getMetaKey();
  }
  // eslint-disable-next-line no-restricted-syntax
  set metaKey(metaKey) {
    this.setMetaKey(metaKey);
  }
  /**
   * @param metaKey - Whether the meta key is pressed.
   * @internal
   */
  setMetaKey(metaKey) {
    this._metaKey.set(metaKey);
  }
  /**
   * Whether the ctrl or command key is currently pressed.
   */
  getCtrlKey() {
    return this._ctrlKey.get();
  }
  /**
   * @deprecated Use `getCtrlKey()` instead.
   */
  // eslint-disable-next-line no-restricted-syntax
  get ctrlKey() {
    return this.getCtrlKey();
  }
  // eslint-disable-next-line no-restricted-syntax
  set ctrlKey(ctrlKey) {
    this.setCtrlKey(ctrlKey);
  }
  /**
   * @param ctrlKey - Whether the ctrl key is pressed.
   * @internal
   */
  setCtrlKey(ctrlKey) {
    this._ctrlKey.set(ctrlKey);
  }
  /**
   * Whether the alt or option key is currently pressed.
   */
  getAltKey() {
    return this._altKey.get();
  }
  /**
   * @deprecated Use `getAltKey()` instead.
   */
  // eslint-disable-next-line no-restricted-syntax
  get altKey() {
    return this.getAltKey();
  }
  // eslint-disable-next-line no-restricted-syntax
  set altKey(altKey) {
    this.setAltKey(altKey);
  }
  /**
   * @param altKey - Whether the alt key is pressed.
   * @internal
   */
  setAltKey(altKey) {
    this._altKey.set(altKey);
  }
  /**
   * Is the accelerator key (cmd on mac, ctrl elsewhere) currently pressed.
   */
  getAccelKey() {
    return isAccelKey({ metaKey: this.getMetaKey(), ctrlKey: this.getCtrlKey() });
  }
  /**
   * @deprecated Use `getAccelKey()` instead.
   */
  // eslint-disable-next-line no-restricted-syntax
  get accelKey() {
    return this.getAccelKey();
  }
  /**
   * Whether the user is dragging.
   */
  getIsDragging() {
    return this._isDragging.get();
  }
  /**
   * Soon to be deprecated, use `getIsDragging()` instead.
   */
  // eslint-disable-next-line no-restricted-syntax
  get isDragging() {
    return this.getIsDragging();
  }
  // eslint-disable-next-line no-restricted-syntax
  set isDragging(isDragging) {
    this.setIsDragging(isDragging);
  }
  /**
   * @param isDragging - Whether the user is dragging.
   */
  setIsDragging(isDragging) {
    this._isDragging.set(isDragging);
  }
  /**
   * Whether the user is pointing.
   */
  getIsPointing() {
    return this._isPointing.get();
  }
  /**
   * @deprecated Use `getIsPointing()` instead.
   */
  // eslint-disable-next-line no-restricted-syntax
  get isPointing() {
    return this.getIsPointing();
  }
  // eslint-disable-next-line no-restricted-syntax
  set isPointing(isPointing) {
    this.setIsPointing(isPointing);
  }
  /**
   * @param isPointing - Whether the user is pointing.
   * @internal
   */
  setIsPointing(isPointing) {
    this._isPointing.set(isPointing);
  }
  /**
   * Whether the user is pinching.
   */
  getIsPinching() {
    return this._isPinching.get();
  }
  /**
   * @deprecated Use `getIsPinching()` instead.
   */
  // eslint-disable-next-line no-restricted-syntax
  get isPinching() {
    return this.getIsPinching();
  }
  // eslint-disable-next-line no-restricted-syntax
  set isPinching(isPinching) {
    this.setIsPinching(isPinching);
  }
  /**
   * @param isPinching - Whether the user is pinching.
   * @internal
   */
  setIsPinching(isPinching) {
    this._isPinching.set(isPinching);
  }
  /**
   * Whether the user is editing.
   */
  getIsEditing() {
    return this._isEditing.get();
  }
  /**
   * @deprecated Use `getIsEditing()` instead.
   */
  // eslint-disable-next-line no-restricted-syntax
  get isEditing() {
    return this.getIsEditing();
  }
  // eslint-disable-next-line no-restricted-syntax
  set isEditing(isEditing) {
    this.setIsEditing(isEditing);
  }
  /**
   * @param isEditing - Whether the user is editing.
   */
  setIsEditing(isEditing) {
    this._isEditing.set(isEditing);
  }
  /**
   * Whether the user is panning.
   */
  getIsPanning() {
    return this._isPanning.get();
  }
  /**
   * @deprecated Use `getIsPanning()` instead.
   */
  // eslint-disable-next-line no-restricted-syntax
  get isPanning() {
    return this.getIsPanning();
  }
  // eslint-disable-next-line no-restricted-syntax
  set isPanning(isPanning) {
    this.setIsPanning(isPanning);
  }
  /**
   * @param isPanning - Whether the user is panning.
   * @internal
   */
  setIsPanning(isPanning) {
    this._isPanning.set(isPanning);
  }
  /**
   * Whether the user is spacebar panning.
   */
  getIsSpacebarPanning() {
    return this._isSpacebarPanning.get();
  }
  /**
   * @deprecated Use `getIsSpacebarPanning()` instead.
   */
  // eslint-disable-next-line no-restricted-syntax
  get isSpacebarPanning() {
    return this.getIsSpacebarPanning();
  }
  // eslint-disable-next-line no-restricted-syntax
  set isSpacebarPanning(isSpacebarPanning) {
    this.setIsSpacebarPanning(isSpacebarPanning);
  }
  /**
   * @param isSpacebarPanning - Whether the user is spacebar panning.
   * @internal
   */
  setIsSpacebarPanning(isSpacebarPanning) {
    this._isSpacebarPanning.set(isSpacebarPanning);
  }
  _getHasCollaborators() {
    return this.editor.getCollaborators().length > 0;
  }
  /**
   * Update the pointer velocity based on elapsed time. Called by the tick manager.
   * @param elapsed - The time elapsed since the last tick in milliseconds.
   * @internal
   */
  updatePointerVelocity(elapsed) {
    const currentScreenPoint = this.getCurrentScreenPoint();
    const pointerVelocity = this.getPointerVelocity();
    if (elapsed === 0) return;
    const delta = Vec.Sub(currentScreenPoint, this._velocityPrevPoint);
    this._velocityPrevPoint = currentScreenPoint.clone();
    const length = delta.len();
    const direction = length ? delta.div(length) : new Vec(0, 0);
    const next = pointerVelocity.clone().lrp(direction.mul(length / elapsed), 0.5);
    if (Math.abs(next.x) < 0.01) next.x = 0;
    if (Math.abs(next.y) < 0.01) next.y = 0;
    if (!pointerVelocity.equals(next)) {
      this._pointerVelocity.set(next);
    }
  }
  /**
   * Update the input points from a pointer, pinch, or wheel event.
   *
   * @param info - The event info.
   * @internal
   */
  updateFromEvent(info) {
    const currentScreenPoint = this._currentScreenPoint.__unsafe__getWithoutCapture();
    const currentPagePoint = this._currentPagePoint.__unsafe__getWithoutCapture();
    const isPinching = this._isPinching.__unsafe__getWithoutCapture();
    const { screenBounds } = this.editor.store.unsafeGetWithoutCapture(TLINSTANCE_ID);
    const { x: cx, y: cy, z: cz } = unsafe__withoutCapture(() => this.editor.getCamera());
    const sx = info.point.x - screenBounds.x;
    const sy = info.point.y - screenBounds.y;
    const sz = info.point.z ?? 0.5;
    this._previousScreenPoint.set(currentScreenPoint);
    this._previousPagePoint.set(currentPagePoint);
    this._currentScreenPoint.set(new Vec(sx, sy));
    const nx = sx / cz - cx;
    const ny = sy / cz - cy;
    if (isFinite(nx) && isFinite(ny)) {
      this._currentPagePoint.set(new Vec(nx, ny, sz));
    }
    this._isPen.set(info.type === "pointer" && info.isPen);
    if (info.name === "pointer_down" || isPinching) {
      this._pointerVelocity.set(new Vec());
      this._originScreenPoint.set(this._currentScreenPoint.__unsafe__getWithoutCapture());
      this._originPagePoint.set(this._currentPagePoint.__unsafe__getWithoutCapture());
    }
    if (this._getHasCollaborators()) {
      this.editor.run(
        () => {
          const pagePoint = this._currentPagePoint.__unsafe__getWithoutCapture();
          this.editor.store.put([
            {
              id: TLPOINTER_ID,
              typeName: "pointer",
              x: pagePoint.x,
              y: pagePoint.y,
              lastActivityTimestamp: (
                // If our pointer moved only because we're following some other user, then don't
                // update our last activity timestamp; otherwise, update it to the current timestamp.
                (info.type === "pointer" && info.pointerId === INTERNAL_POINTER_IDS.CAMERA_MOVE ? this.editor.store.unsafeGetWithoutCapture(TLPOINTER_ID)?.lastActivityTimestamp ?? Date.now() : Date.now())
              ),
              meta: {}
            }
          ]);
        },
        { history: "ignore" }
      );
    }
  }
  toJson() {
    return {
      originPagePoint: this._originPagePoint.get().toJson(),
      originScreenPoint: this._originScreenPoint.get().toJson(),
      previousPagePoint: this._previousPagePoint.get().toJson(),
      previousScreenPoint: this._previousScreenPoint.get().toJson(),
      currentPagePoint: this._currentPagePoint.get().toJson(),
      currentScreenPoint: this._currentScreenPoint.get().toJson(),
      pointerVelocity: this._pointerVelocity.get().toJson(),
      shiftKey: this._shiftKey.get(),
      metaKey: this._metaKey.get(),
      ctrlKey: this._ctrlKey.get(),
      altKey: this._altKey.get(),
      isPen: this._isPen.get(),
      isDragging: this._isDragging.get(),
      isPointing: this._isPointing.get(),
      isPinching: this._isPinching.get(),
      isEditing: this._isEditing.get(),
      isPanning: this._isPanning.get(),
      isSpacebarPanning: this._isSpacebarPanning.get(),
      keys: Array.from(this.keys.keys()),
      buttons: Array.from(this.buttons.keys())
    };
  }
}
_init = __decoratorStart(null);
__decorateElement(_init, 1, "_getHasCollaborators", __getHasCollaborators_dec, InputsManager);
__decoratorMetadata(_init, InputsManager);
export {
  InputsManager
};
//# sourceMappingURL=InputsManager.mjs.map
