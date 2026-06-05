import { Atom } from '@tldraw/state';
import { AtomOptions } from '@tldraw/state';
import { Computed } from '@tldraw/state';
import { ComputedOptions } from '@tldraw/state';
import { FunctionComponent } from 'react';
import { default as React_2 } from 'react';
import { Signal } from '@tldraw/state';

/**
 * Returns a tracked version of the given component.
 * Any signals whose values are read while the component renders will be tracked.
 * If any of the tracked signals change later it will cause the component to re-render.
 *
 * This also wraps the component in a React.memo() call, so it will only re-render
 * when props change OR when any tracked signals change. This provides optimal
 * performance by preventing unnecessary re-renders while maintaining reactivity.
 *
 * The function handles special React component types like forwardRef and memo
 * components automatically, preserving their behavior while adding reactivity.
 *
 * @param baseComponent - The React functional component to make reactive to signal changes
 * @returns A memoized component that re-renders when props or tracked signals change
 *
 * @example
 * ```ts
 * import { atom } from '@tldraw/state'
 * import { track, useAtom } from '@tldraw/state-react'
 *
 * const Counter = track(function Counter(props: CounterProps) {
 *   const count = useAtom('count', 0)
 *   const increment = useCallback(() => count.set(count.get() + 1), [count])
 *   return <button onClick={increment}>{count.get()}</button>
 * })
 *
 * // Component automatically re-renders when count signal changes
 * ```
 *
 * @example
 * ```ts
 * // Works with forwardRef components
 * const TrackedInput = track(React.forwardRef<HTMLInputElement, InputProps>(
 *   function TrackedInput(props, ref) {
 *     const theme = useValue(themeSignal)
 *     return <input ref={ref} style={{ color: theme.textColor }} {...props} />
 *   }
 * ))
 * ```
 *
 * @public
 */
export declare function track<T extends FunctionComponent<any>>(baseComponent: T): React_2.NamedExoticComponent<React_2.ComponentProps<T>>;

/**
 * Creates a new atom and returns it. The atom will be created only once.
 *
 * See `atom`.
 *
 * @example
 * ```ts
 * const Counter = track(function Counter () {
 *   const count = useAtom('count', 0)
 *   const increment = useCallback(() => count.set(count.get() + 1), [count])
 *   return <button onClick={increment}>{count.get()}</button>
 * })
 * ```
 *
 * @param name - The name of the atom. This does not need to be globally unique. It is used for debugging and performance profiling.
 * @param valueOrInitialiser - The initial value of the atom. If this is a function, it will be called to get the initial value.
 * @param options - Options for the atom.
 *
 * @public
 */
export declare function useAtom<Value, Diff = unknown>(name: string, valueOrInitialiser: (() => Value) | Value, options?: AtomOptions<Value, Diff>): Atom<Value, Diff>;

/**
 * Creates a new computed signal that automatically tracks its dependencies and recalculates when they change.
 * This overload is for basic computed values without custom options.
 *
 * @param name - A descriptive name for the computed signal, used for debugging and identification
 * @param compute - A function that computes the value, automatically tracking any signal dependencies
 * @param deps - React dependency array that controls when the computed signal is recreated
 * @returns A computed signal containing the calculated value
 *
 * @example
 * ```ts
 * const firstName = atom('firstName', 'John')
 * const lastName = atom('lastName', 'Doe')
 *
 * function UserProfile() {
 *   const fullName = useComputed(
 *     'fullName',
 *     () => `${firstName.get()} ${lastName.get()}`,
 *     [firstName, lastName]
 *   )
 *
 *   return <div>Welcome, {fullName.get()}!</div>
 * }
 * ```
 *
 * @public
 */
export declare function useComputed<Value>(name: string, compute: () => Value, deps: any[]): Computed<Value>;

/**
 * Creates a new computed signal with custom options for advanced behavior like custom equality checking,
 * diff computation, and history tracking. The computed signal will be created only once.
 *
 * @param name - A descriptive name for the computed signal, used for debugging and identification
 * @param compute - A function that computes the value, automatically tracking any signal dependencies
 * @param opts - Configuration options for the computed signal
 *   - isEqual - Custom equality function to determine if the computed value has changed
 *   - computeDiff - Function to compute diffs between old and new values for history tracking
 *   - historyLength - Maximum number of diffs to keep in history buffer for time-travel functionality
 * @param deps - React dependency array that controls when the computed signal is recreated
 * @returns A computed signal containing the calculated value with the specified options
 *
 * @example
 * ```ts
 * function ShoppingCart() {
 *   const items = useAtom('items', [])
 *
 *   // Computed with custom equality to avoid recalculation for equivalent arrays
 *   const sortedItems = useComputed(
 *     'sortedItems',
 *     () => items.get().sort((a, b) => a.name.localeCompare(b.name)),
 *     {
 *       isEqual: (a, b) => a.length === b.length && a.every((item, i) => item.id === b[i].id)
 *     },
 *     [items]
 *   )
 *
 *   return <ItemList items={sortedItems.get()} />
 * }
 * ```
 *
 * @public
 */
export declare function useComputed<Value, Diff = unknown>(name: string, compute: () => Value, opts: ComputedOptions<Value, Diff>, deps: any[]): Computed<Value>;

/**
 * A React hook that runs side effects immediately in response to signal changes, without throttling.
 * Unlike useReactor which batches updates to animation frames, useQuickReactor executes the effect
 * function immediately when dependencies change, making it ideal for critical updates that cannot wait.
 *
 * The effect runs immediately when the component mounts and whenever tracked signals change.
 * Updates are not throttled, so the effect executes synchronously on every change.
 *
 * @example
 * ```ts
 * function DataSynchronizer() {
 *   const criticalData = useAtom('criticalData', null)
 *
 *   useQuickReactor('sync-data', () => {
 *     const data = criticalData.get()
 *     if (data) {
 *       // Send immediately - don't wait for next frame
 *       sendToServer(data)
 *     }
 *   }, [criticalData])
 *
 *   return <div>Sync status updated</div>
 * }
 * ```
 *
 * @example
 * ```ts
 * function CursorUpdater({ editor }) {
 *   useQuickReactor('update-cursor', () => {
 *     const cursor = editor.getInstanceState().cursor
 *     document.body.style.cursor = cursor.type
 *   }, [])
 * }
 * ```
 *
 * @param name - A descriptive name for the reactor, used for debugging and performance profiling
 * @param reactFn - The effect function to execute when signals change. Should not return a value.
 * @param deps - Optional dependency array that controls when the reactor is recreated. Works like useEffect deps.
 * @public
 */
export declare function useQuickReactor(name: string, reactFn: () => void, deps?: any[]): void;

/**
 * A React hook that runs a side effect in response to changes in signals (reactive state).
 *
 * The effect function will automatically track any signals (atoms, computed values) that are
 * accessed during its execution. When any of those signals change, the effect will be
 * scheduled to run again on the next animation frame.
 *
 * This is useful for performing side effects (like updating the DOM, making API calls, or
 * updating external state) in response to changes in tldraw's reactive state system, while
 * keeping those effects efficiently batched and throttled.
 *
 * @example
 * ```tsx
 * import { useReactor, useEditor } from 'tldraw'
 *
 * function MyComponent() {
 *   const editor = useEditor()
 *
 *   // Update document title when shapes change
 *   useReactor(
 *     'update title',
 *     () => {
 *       const shapes = editor.getCurrentPageShapes()
 *       document.title = `Shapes: ${shapes.length}`
 *     },
 *     [editor]
 *   )
 *
 *   return <div>...</div>
 * }
 * ```
 *
 * @example
 * ```tsx
 * import { useReactor, useEditor } from 'tldraw'
 *
 * function SelectionAnnouncer() {
 *   const editor = useEditor()
 *
 *   // Announce selection changes for accessibility
 *   useReactor(
 *     'announce selection',
 *     () => {
 *       const selectedIds = editor.getSelectedShapeIds()
 *       if (selectedIds.length > 0) {
 *         console.log(`Selected ${selectedIds.length} shape(s)`)
 *       }
 *     },
 *     [editor]
 *   )
 *
 *   return null
 * }
 * ```
 *
 * @remarks
 * The effect is throttled to run at most once per animation frame using `requestAnimationFrame`.
 * This makes it suitable for effects that need to respond to state changes but don't need to
 * run synchronously.
 *
 * If you need the effect to run immediately without throttling, use {@link useQuickReactor} instead.
 *
 * The effect function will be re-created when any of the `deps` change, similar to React's
 * `useEffect`. The effect automatically tracks which signals it accesses, so you don't need
 * to manually specify them as dependencies.
 *
 * @param name - A debug name for the effect, useful for debugging and performance profiling.
 * @param reactFn - The effect function to run. Any signals accessed in this function will be tracked.
 * @param deps - React dependencies array. The effect will be recreated when these change. Defaults to `[]`.
 *
 * @public
 */
export declare function useReactor(name: string, reactFn: () => void, deps?: any[] | undefined): void;

/**
 * Wraps some synchronous react render logic in a reactive tracking context.
 *
 * This allows you to use reactive values transparently.
 *
 * See the `track` component wrapper, which uses this under the hood.
 *
 * @param name - A debug name for the reactive tracking context
 * @param render - The render function that accesses reactive values
 * @param deps - Optional dependency array to control when the tracking context is recreated
 * @returns The result of calling the render function
 *
 * @example
 * ```ts
 * function MyComponent() {
 *   return useStateTracking('MyComponent', () => {
 *     const editor = useEditor()
 *     return <div>Num shapes: {editor.getCurrentPageShapes().length}</div>
 *   })
 * }
 * ```
 *
 *
 * @public
 */
export declare function useStateTracking<T>(name: string, render: () => T, deps?: unknown[]): T;

/**
 * Extracts the current value from a signal and subscribes the component to changes.
 *
 * This is the most straightforward way to read signal values in React components.
 * When the signal changes, the component will automatically re-render with the new value.
 *
 * Note: You do not need to use this hook if you are wrapping the component with {@link track},
 * as tracked components automatically subscribe to any signals accessed with `.get()`.
 *
 * @param value - The signal to read the value from
 * @returns The current value of the signal
 *
 * @example
 * ```ts
 * import { atom } from '@tldraw/state'
 * import { useValue } from '@tldraw/state-react'
 *
 * const count = atom('count', 0)
 *
 * function Counter() {
 *   const currentCount = useValue(count)
 *   return (
 *     <button onClick={() => count.set(currentCount + 1)}>
 *       Count: {currentCount}
 *     </button>
 *   )
 * }
 * ```
 *
 * @public
 */
export declare function useValue<Value>(value: Signal<Value>): Value;

/**
 * Creates a computed value with automatic dependency tracking and subscribes to changes.
 *
 * This overload allows you to compute a value from one or more signals with automatic
 * memoization. The computed function will only re-execute when its dependencies change,
 * and the component will only re-render when the computed result changes.
 *
 * @param name - A descriptive name for debugging purposes
 * @param fn - Function that computes the value, should call `.get()` on any signals it depends on
 * @param deps - Array of signals that the computed function depends on
 * @returns The computed value
 *
 * @example
 * ```ts
 * import { atom } from '@tldraw/state'
 * import { useValue } from '@tldraw/state-react'
 *
 * const firstName = atom('firstName', 'John')
 * const lastName = atom('lastName', 'Doe')
 *
 * function UserGreeting() {
 *   const fullName = useValue('fullName', () => {
 *     return `${firstName.get()} ${lastName.get()}`
 *   }, [firstName, lastName])
 *
 *   return <div>Hello {fullName}!</div>
 * }
 * ```
 *
 * @public
 */
export declare function useValue<Value>(name: string, fn: () => Value, deps: unknown[]): Value;

export { }
