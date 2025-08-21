In the `src` directory there are a lot of main components. They are separated by concepts. 

The `data` folder has additional data structures like `Nest`, `ReadonlyNest`, callable `nest()`, `ReadonlySet`, `ReadonlyMap` and callable `map()`. Nest is like map, but has methods to manage nested objects and arrays easier.

The `emitter` folder expands how events can be used. `EventEmitter` uses both type maps and typescript generics. You can prioritize listeners over or below others. `EventEmitter` sets up and runs task queue for all listeners given an event when emitted. The `ExpressEmitter` extends the `EventEmitter` allowing regex. Then there's `RouteEmitter` that is an event driven router (extends `ExpressEmitter`).

The `queue` folder has an `ItemQueue` you can easy sort items (not necessarily a function) and a `TaskQueue` that extends `ItemQueue` specifically for functions (as items).

The `router` folder has generically defined `Request`, `Response`, and `Router` class that extends `ExpressEmitter`. The `Router` is different from the `RouteEmitter` because `Router` exclusively assumes that the only arguments are `Request`, `Response` and an arbitrary context (`Router` by default). 

While most developers know a router is used in NodeJS HTTP, our `Router` can be used with terminal, whatwg servers, web/sockets, as well. Basically any concept that processes requests and sends responses, this `Router` can be used. Since there isn't a standard spec for request and response across different mediums, we created a normalized `Request` and `Response` class that wraps around the "native" ones. This makes the code developers make using this `router` folder generally the same between http, terminal and web/sockets (makes these mediums more of a plugin pattern).

The `system` folder has to do with file systems and file loading between linux, windows, esm and cjs.

`Exception` extends errors and is more expressive. It also attempts to provide better stack trace support using `Reflection`. `Reflection` is experimental.