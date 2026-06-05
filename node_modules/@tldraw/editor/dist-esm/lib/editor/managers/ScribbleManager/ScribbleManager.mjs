import { uniqueId } from "@tldraw/utils";
import { Vec } from "../../../primitives/Vec.mjs";
class ScribbleManager {
  constructor(editor) {
    this.editor = editor;
  }
  sessions = /* @__PURE__ */ new Map();
  // ==================== SESSION API ====================
  /**
   * Start a new session for grouping scribbles.
   * Returns a session ID that can be used with other session methods.
   *
   * @param options - Session configuration
   * @returns Session ID
   * @public
   */
  startSession(options = {}) {
    const id = options.id ?? uniqueId();
    const session = {
      id,
      items: [],
      state: "active",
      options: {
        selfConsume: options.selfConsume ?? true,
        idleTimeoutMs: options.idleTimeoutMs ?? 0,
        fadeMode: options.fadeMode ?? "individual",
        fadeEasing: options.fadeEasing ?? (options.fadeMode === "grouped" ? "ease-in" : "linear"),
        fadeDurationMs: options.fadeDurationMs ?? this.editor.options.laserFadeoutMs
      },
      fadeElapsed: 0,
      totalPointsAtFadeStart: 0
    };
    this.sessions.set(id, session);
    if (session.options.idleTimeoutMs > 0) {
      this.resetIdleTimeout(session);
    }
    return id;
  }
  /**
   * Add a scribble to a session.
   *
   * @param sessionId - The session ID
   * @param scribble - Partial scribble properties
   * @param scribbleId - Optional scribble ID
   * @public
   */
  addScribbleToSession(sessionId, scribble, scribbleId = uniqueId()) {
    const session = this.sessions.get(sessionId);
    if (!session) throw Error(`Session ${sessionId} not found`);
    const item = {
      id: scribbleId,
      scribble: {
        id: scribbleId,
        size: 20,
        color: "accent",
        opacity: 0.8,
        delay: 0,
        points: [],
        shrink: 0.1,
        taper: true,
        ...scribble,
        state: "starting"
      },
      timeoutMs: 0,
      delayRemaining: scribble.delay ?? 0,
      prev: null,
      next: null
    };
    session.items.push(item);
    if (session.options.idleTimeoutMs > 0) {
      this.resetIdleTimeout(session);
    }
    return item;
  }
  /**
   * Add a point to a scribble in a session.
   *
   * @param sessionId - The session ID
   * @param scribbleId - The scribble ID
   * @param x - X coordinate
   * @param y - Y coordinate
   * @param z - Z coordinate (pressure)
   * @public
   */
  addPointToSession(sessionId, scribbleId, x, y, z = 0.5) {
    const session = this.sessions.get(sessionId);
    if (!session) throw Error(`Session ${sessionId} not found`);
    const item = session.items.find((i) => i.id === scribbleId);
    if (!item) throw Error(`Scribble ${scribbleId} not found in session ${sessionId}`);
    const point = { x, y, z };
    if (!item.prev || Vec.Dist(item.prev, point) >= 1) {
      item.next = point;
    }
    if (session.options.idleTimeoutMs > 0) {
      this.resetIdleTimeout(session);
    }
    return item;
  }
  /**
   * Extend a session, resetting its idle timeout.
   *
   * @param sessionId - The session ID
   * @public
   */
  extendSession(sessionId) {
    const session = this.sessions.get(sessionId);
    if (!session) return;
    if (session.options.idleTimeoutMs > 0) {
      this.resetIdleTimeout(session);
    }
  }
  /**
   * Stop a session, triggering fade-out.
   *
   * @param sessionId - The session ID
   * @public
   */
  stopSession(sessionId) {
    const session = this.sessions.get(sessionId);
    if (!session || session.state !== "active") return;
    this.clearIdleTimeout(session);
    session.state = "stopping";
    if (session.options.fadeMode === "grouped") {
      session.totalPointsAtFadeStart = session.items.reduce(
        (sum, item) => sum + item.scribble.points.length,
        0
      );
      session.fadeElapsed = 0;
      for (const item of session.items) {
        item.scribble.state = "stopping";
      }
    } else {
      for (const item of session.items) {
        item.delayRemaining = Math.min(item.delayRemaining, 200);
        item.scribble.state = "stopping";
      }
    }
  }
  /**
   * Clear all scribbles in a session immediately.
   *
   * @param sessionId - The session ID
   * @public
   */
  clearSession(sessionId) {
    const session = this.sessions.get(sessionId);
    if (!session) return;
    this.clearIdleTimeout(session);
    for (const item of session.items) {
      item.scribble.points.length = 0;
    }
    session.state = "complete";
  }
  /**
   * Check if a session is active.
   *
   * @param sessionId - The session ID
   * @public
   */
  isSessionActive(sessionId) {
    const session = this.sessions.get(sessionId);
    return session?.state === "active";
  }
  // ==================== SIMPLE API (for eraser, select, etc.) ====================
  /**
   * Add a scribble using the default self-consuming behavior.
   * Creates an implicit session for the scribble.
   *
   * @param scribble - Partial scribble properties
   * @param id - Optional scribble id
   * @returns The created scribble item
   * @public
   */
  addScribble(scribble, id = uniqueId()) {
    const sessionId = this.startSession();
    return this.addScribbleToSession(sessionId, scribble, id);
  }
  /**
   * Add a point to a scribble. Searches all sessions.
   *
   * @param id - The scribble id
   * @param x - X coordinate
   * @param y - Y coordinate
   * @param z - Z coordinate (pressure)
   * @public
   */
  addPoint(id, x, y, z = 0.5) {
    for (const session of this.sessions.values()) {
      const item = session.items.find((i) => i.id === id);
      if (item) {
        const point = { x, y, z };
        if (!item.prev || Vec.Dist(item.prev, point) >= 1) {
          item.next = point;
        }
        if (session.options.idleTimeoutMs > 0) {
          this.resetIdleTimeout(session);
        }
        return item;
      }
    }
    throw Error(`Scribble with id ${id} not found`);
  }
  /**
   * Mark a scribble as complete (done being drawn but not yet fading).
   * Searches all sessions.
   *
   * @param id - The scribble id
   * @public
   */
  complete(id) {
    for (const session of this.sessions.values()) {
      const item = session.items.find((i) => i.id === id);
      if (item) {
        if (item.scribble.state === "starting" || item.scribble.state === "active") {
          item.scribble.state = "complete";
        }
        return item;
      }
    }
    throw Error(`Scribble with id ${id} not found`);
  }
  /**
   * Stop a scribble. Searches all sessions.
   *
   * @param id - The scribble id
   * @public
   */
  stop(id) {
    for (const session of this.sessions.values()) {
      const item = session.items.find((i) => i.id === id);
      if (item) {
        item.delayRemaining = Math.min(item.delayRemaining, 200);
        item.scribble.state = "stopping";
        return item;
      }
    }
    throw Error(`Scribble with id ${id} not found`);
  }
  /**
   * Stop and remove all sessions.
   *
   * @public
   */
  reset() {
    for (const session of this.sessions.values()) {
      this.clearIdleTimeout(session);
    }
    this.sessions.clear();
    this.editor.updateInstanceState({ scribbles: [] });
  }
  /**
   * Update on each animation frame.
   *
   * @param elapsed - The number of milliseconds since the last tick.
   * @public
   */
  tick(elapsed) {
    const currentScribbles = this.editor.getInstanceState().scribbles;
    if (this.sessions.size === 0 && currentScribbles.length === 0) return;
    this.editor.run(() => {
      for (const session of this.sessions.values()) {
        this.tickSession(session, elapsed);
      }
      for (const [id, session] of this.sessions) {
        if (session.state === "complete") {
          this.clearIdleTimeout(session);
          this.sessions.delete(id);
        }
      }
      const scribbles = [];
      for (const session of this.sessions.values()) {
        for (const item of session.items) {
          if (item.scribble.points.length > 0) {
            scribbles.push({
              ...item.scribble,
              points: [...item.scribble.points]
            });
          }
        }
      }
      this.editor.updateInstanceState({ scribbles });
    });
  }
  // ==================== PRIVATE HELPERS ====================
  resetIdleTimeout(session) {
    this.clearIdleTimeout(session);
    session.idleTimeoutHandle = this.editor.timers.setTimeout(() => {
      this.stopSession(session.id);
    }, session.options.idleTimeoutMs);
  }
  clearIdleTimeout(session) {
    if (session.idleTimeoutHandle !== void 0) {
      clearTimeout(session.idleTimeoutHandle);
      session.idleTimeoutHandle = void 0;
    }
  }
  tickSession(session, elapsed) {
    if (session.state === "complete") return;
    if (session.state === "stopping" && session.options.fadeMode === "grouped") {
      this.tickGroupedFade(session, elapsed);
    } else {
      this.tickSessionItems(session, elapsed);
    }
    const hasContent = session.items.some((item) => item.scribble.points.length > 0);
    if (!hasContent && (session.state === "stopping" || session.items.length === 0)) {
      session.state = "complete";
    }
  }
  tickSessionItems(session, elapsed) {
    for (const item of session.items) {
      const shouldSelfConsume = session.options.selfConsume || session.state === "stopping" || item.scribble.state === "stopping";
      if (shouldSelfConsume) {
        this.tickSelfConsumingItem(item, elapsed);
      } else {
        this.tickPersistentItem(item);
      }
    }
    if (session.options.fadeMode === "individual") {
      for (let i = session.items.length - 1; i >= 0; i--) {
        if (session.items[i].scribble.points.length === 0) {
          session.items.splice(i, 1);
        }
      }
    }
  }
  tickPersistentItem(item) {
    const { scribble } = item;
    if (scribble.state === "starting") {
      const { next, prev } = item;
      if (next && next !== prev) {
        item.prev = next;
        scribble.points.push(next);
      }
      if (scribble.points.length > 8) {
        scribble.state = "active";
      }
      return;
    }
    if (scribble.state === "active") {
      const { next, prev } = item;
      if (next && next !== prev) {
        item.prev = next;
        scribble.points.push(next);
      }
    }
  }
  tickSelfConsumingItem(item, elapsed) {
    const { scribble } = item;
    if (scribble.state === "starting") {
      const { next: next2, prev: prev2 } = item;
      if (next2 && next2 !== prev2) {
        item.prev = next2;
        scribble.points.push(next2);
      }
      if (scribble.points.length > 8) {
        scribble.state = "active";
      }
      return;
    }
    if (item.delayRemaining > 0) {
      item.delayRemaining = Math.max(0, item.delayRemaining - elapsed);
    }
    item.timeoutMs += elapsed;
    if (item.timeoutMs >= 16) {
      item.timeoutMs = 0;
    }
    const { delayRemaining, timeoutMs, prev, next } = item;
    switch (scribble.state) {
      case "active": {
        if (next && next !== prev) {
          item.prev = next;
          scribble.points.push(next);
          if (delayRemaining === 0 && scribble.points.length > 8) {
            scribble.points.shift();
          }
        } else {
          if (timeoutMs === 0) {
            if (scribble.points.length > 1) {
              scribble.points.shift();
            } else {
              item.delayRemaining = scribble.delay;
            }
          }
        }
        break;
      }
      case "stopping": {
        if (delayRemaining === 0 && timeoutMs === 0) {
          if (scribble.points.length <= 1) {
            scribble.points.length = 0;
            return;
          }
          if (scribble.shrink) {
            scribble.size = Math.max(1, scribble.size * (1 - scribble.shrink));
          }
          scribble.points.shift();
        }
        break;
      }
      case "paused": {
        break;
      }
    }
  }
  tickGroupedFade(session, elapsed) {
    session.fadeElapsed += elapsed;
    let remainingPoints = 0;
    for (const item of session.items) {
      remainingPoints += item.scribble.points.length;
    }
    if (remainingPoints === 0) return;
    if (session.fadeElapsed >= session.options.fadeDurationMs) {
      for (const item of session.items) {
        item.scribble.points.length = 0;
      }
      return;
    }
    const progress = session.fadeElapsed / session.options.fadeDurationMs;
    const easedProgress = session.options.fadeEasing === "ease-in" ? progress * progress : progress;
    const targetRemoved = Math.floor(easedProgress * session.totalPointsAtFadeStart);
    const actuallyRemoved = session.totalPointsAtFadeStart - remainingPoints;
    const pointsToRemove = Math.max(1, targetRemoved - actuallyRemoved);
    let removed = 0;
    let itemIndex = 0;
    while (removed < pointsToRemove && itemIndex < session.items.length) {
      const item = session.items[itemIndex];
      if (item.scribble.points.length > 0) {
        item.scribble.points.shift();
        removed++;
      } else {
        itemIndex++;
      }
    }
  }
}
export {
  ScribbleManager
};
//# sourceMappingURL=ScribbleManager.mjs.map
