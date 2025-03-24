//local
import { ResponseStatus } from './types';

/**
 * Status Codes as return states by the `Emitter`. These codes are 
 * useful to find out what happened after an `Emitter.emit()` was 
 * called. For example if there are no actions, the `Status` will be 
 * `NOT_FOUND`. If any of the actions returns `false`, then the next 
 * actions won't be called and the `Status` will be `ABORTED`. If all 
 * actions were called and the last one did not return `false`, then 
 * the `Status` will be `OK`.
 * 
 * see: https://developer.mozilla.org/en-US/docs/Web/HTTP/Status
 */
export const codes: Record<string, ResponseStatus> = {
  //------------------------------------------------------------------//
  // 100 Status Codes

  // This interim response indicates that the client should continue the 
  // request or ignore the response if the request is already finished.
  CONTINUE: { code: 100, status: 'Continue' },
  // This code indicates that a request has been received by the 
  // server, but no status was available at the time of the response.
  PROCESSING: { code: 102, status: 'Processing' },

  //------------------------------------------------------------------//
  // 200 Status Codes

  // The request succeeded. 
  OK: { code: 200, status: 'OK' },
  // The request succeeded, and a new resource was created 
  // as a result. This is typically the response sent after 
  // POST requests, or some PUT requests.
  CREATED: { code: 201, status: 'Created' },
  // The request has been received but not yet acted upon. It is 
  // noncommittal, since there is no way in HTTP to later send an 
  // asynchronous response indicating the outcome of the request. 
  // It is intended for cases where another process or server handles 
  // the request, or for batch processing.
  ACCEPTED: { code: 202, status: 'Accepted' },
  // There is no content to send for this request, but the 
  // headers are useful. The user agent may update its cached 
  // headers for this resource with the new ones.
  EMPTY: { code: 204, status: 'No Content' },
  // Tells the user agent to reset the document which sent this request.
  RESET: { code: 205, status: 'Reset Content' },
  // This response code is used in response to a range request  
  // when the client has requested a part or parts of a resource.
  PARTIAL: { code: 206, status: 'Partial Content' },

  //------------------------------------------------------------------//
  // 300 Status Codes

  // The URL of the requested resource has been changed 
  // permanently. The new URL is given in the response.
  MOVED: { code: 301, status: 'Moved Permanently' },
  // This response code means that the URI of requested 
  // resource has been changed temporarily. Further changes 
  // in the URI might be made in the future, so the same URI 
  // should be used by the client in future requests.
  FOUND: { code: 302, status: 'Found' },
  // The server sent this response to direct the client to 
  // the requested resource at another URI with a GET request.
  REDIRECT: { code: 303, status: 'See Other' },
  // This is used for caching purposes. It tells the client that 
  // the response has not been modified, so the client can 
  // continue to use the same cached version of the response.
  CACHE: { code: 304, status: 'Not Modified' },
  // The server sends this response to direct the client to the 
  // requested resource at another URI with the same method that was 
  // used in the prior request. This has the same semantics as the 302 
  // Found response code, with the exception that the user agent must 
  // not change the HTTP method used: if a POST was used in the first 
  // request, a POST must be used in the redirected request.
  TEMPORARY: { code: 307, status: 'Temporary Redirect' },
  // This means that the resource is now permanently located 
  // at another URI, specified by the Location response header. 
  // This has the same semantics as the 301 Moved Permanently 
  // HTTP response code, with the exception that the user agent 
  // must not change the HTTP method used: if a POST was used in 
  // the first request, a POST must be used in the second request.
  PERMANENT: { code: 308, status: 'Permanent Redirect' },
  // Custom status code for when a request is aborted.
  ABORT: { code: 309, status: 'Aborted' },

  //------------------------------------------------------------------//
  // 400 Status Codes

  // The server cannot or will not process the request due to 
  // something that is perceived to be a client error (e.g., malformed 
  // request syntax, invalid request message framing, or deceptive 
  // request routing).
  BAD_REQUEST: { code: 400, status: 'Bad Request' },
  // Although the HTTP standard specifies "unauthorized", 
  // semantically this response means "unauthenticated". 
  // That is, the client must authenticate itself to 
  // the requested response.
  UNAUTHORIZED: { code: 401, status: 'Unauthorized' },
  // The client does not have access rights to the content; 
  // that is, it is unauthorized, so the server is refusing 
  // to give the requested resource. Unlike 401 Unauthorized, 
  // the client's identity is known to the server.
  FORBIDDEN: { code: 403, status: 'Forbidden' },
  // The server cannot find the requested resource. In the browser, 
  // this means the URL is not recognized. In an API, this can also 
  // mean that the endpoint is valid but the resource itself does 
  // not exist. Servers may also send this response instead of 403 
  // Forbidden to hide the existence of a resource from an unauthorized 
  // client. This response code is probably the most well known due to 
  // its frequent occurrence on the web.
  NOT_FOUND: { code: 404, status: 'Not Found' },
  // The request method is known by the server but is not supported 
  // by the tarresource. For example, an API may not allow DELETE 
  // on a resource, or the TRACE method entirely.
  BAD_METHOD: { code: 405, status: 'Method Not Allowed' },
  // This response is sent when the web server, after performing 
  // server-driven content negotiation, doesn't find any content 
  // that conforms to the criteria given by the user agent.
  NOT_ACCEPTABLE: { code: 406, status: 'Not Acceptable' },
  // This response is sent on an idle connection by some servers, 
  // even without any previous request by the client. It means that 
  // the server would like to shut down this unused connection. This 
  // response is used much more since some browsers use HTTP 
  // pre-connection mechanisms to speed up browsing. Some servers may 
  // shut down a connection without sending this message.
  REQUEST_TIMEOUT: { code: 408, status: 'Request Timeout' },
  // This response is sent when a request conflicts with the current 
  // state of the server. In WebDAV remote web authoring, 409 responses 
  // are errors sent to the client so that a user might be able to 
  // resolve a conflict and resubmit the request.
  CONFLICT: { code: 409, status: 'Conflict' },
  // This response is sent when the requested content has been 
  // permanently deleted from server, with no forwarding address. 
  // Clients are expected to remove their caches and links to the 
  // resource. The HTTP specification intends this status code to 
  // be used for "limited-time, promotional services". APIs should 
  // not feel compelled to indicate resources that have been deleted 
  // with this status code.
  GONE: { code: 410, status: 'Gone' },
  // Server rejected the request because the Content-Length 
  // header field is not defined and the server requires it.
  LENGTH_REQUIRED: { code: 411, status: 'Length Required' },
  // The request body is larger than limits defined 
  // by server. The server might close the connection
  // or return an Retry-After header field.
  TOO_LARGE: { code: 413, status: 'Payload Too Large' },
  // The URI requested by the client is longer 
  // than the server is willing to interpret.
  TOO_LONG: { code: 414, status: 'URI Too Long' },
  // The media format of the requested data is not supported 
  // by the server, so the server is rejecting the request.
  UNSUPPORTED_TYPE: { code: 415, status: 'Unsupported Media Type' },
  // The ranges specified by the Range header field in the request 
  // cannot be fulfilled. It's possible that the range is outside 
  // the size of the tarresource's data.
  BAD_RANGE: { code: 416, status: 'Range Not Satisfiable' },
  // This response code means the expectation indicated by the 
  // Expect request header field cannot be met by the server.
  BAD_EXPECTATION: { code: 417, status: 'Expectation Failed' },
  // The request was directed at a server that is not able to 
  // produce a response. This can be sent by a server that is 
  // not configured to produce responses for the combination 
  // of scheme and authority that are included in the request 
  // URI.
  MISDIRECTED: { code: 421, status: 'Misdirected Request' },
  // The request was well-formed but was unable 
  // to be followed due to semantic errors.
  UNPROCESSABLE: { code: 422, status: 'Unprocessable Content' },
  // The resource that is being accessed is locked.
  LOCKED: { code: 423, status: 'Locked' },
  // The request failed due to failure of a previous request.
  BAD_DEPENDENCY: { code: 424, status: 'Failed Dependency' },
  // The server refuses to perform the request using the current 
  // protocol but might be willing to do so after the client upgrades 
  // to a different protocol. The server sends an Upgrade header in a 
  // 426 response to indicate the required protocol(s).
  UPGRADE_REQUIRED: { code: 426, status: 'Upgrade Required' },
  // The origin server requires the request to be conditional. This 
  // response is intended to prevent the 'lost update' problem, where 
  // a client GETs a resource's state, modifies it and PUTs it back to 
  // the server, when meanwhile a third party has modified the state on 
  // the server, leading to a conflict.
  BAD_PRECONDITION: { code: 428, status: 'Precondition Required' },
  // The user has sent too many requests in a given amount of time 
  // (rate limiting).
  TOO_MANY: { code: 429, status: 'Too Many Requests' },
  // The server is unwilling to process the request because its header 
  // fields are too large. The request may be resubmitted after reducing 
  // the size of the request header fields.
  HEADER_TOO_LARGE: { code: 431, status: 'Request Header Fields Too Large' },
  // The user agent requested a resource that cannot legally  
  // be provided, such as a web page censored by a government.
  LEGAL_REASONS: { code: 451, status: 'Unavailable For Legal Reasons' },

  //------------------------------------------------------------------//
  // 500 Status Codes

  // The server has encountered a situation it does not know how to 
  // handle. This error is generic, indicating that the server cannot 
  // find a more appropriate 5XX status code to respond with.
  ERROR: { code: 500, status: 'Internal Server Error' },
  // The request method is not supported by the server and cannot be 
  // handled. The only methods that servers are required to support 
  // (and therefore that must not return this code) are GET and HEAD.
  NOT_IMPLEMENTED: { code: 501, status: 'Not Implemented' },
  // This error response means that the server, while working as a 
  // gateway to a response needed to handle the request, got an 
  // invalid response.
  BAD_GATEWAY: { code: 502, status: 'Bad Gateway' },
  // The server is not ready to handle the request. Common 
  // causes are a server that is down for maintenance or that 
  // is overloaded. Note that together with this response, a 
  // user-friendly page explaining the problem should be sent. 
  // This response should be used for temporary conditions and 
  // the Retry-After HTTP header should, if possible, contain 
  // the estimated time before the recovery of the service. The 
  // webmaster must also take care about the caching-related headers 
  // that are sent along with this response, as these temporary 
  // condition responses should usually not be cached.
  UNAVAILABLE: { code: 503, status: 'Service Unavailable' },
  // This error response is given when the server is acting 
  // as a gateway and cannot a response in time.
  RESPONSE_TIMEOUT: { code: 504, status: 'Gateway Timeout' },
  // The HTTP version used in the request is not supported by the server.
  BAD_VERSION: { code: 505, status: 'HTTP Version Not Supported' },
  // The method could not be performed on the resource because 
  // the server is unable to store the representation needed to 
  // successfully complete the request.
  INSUFFICIENT_STORAGE: { code: 507, status: 'Insufficient Storage' },
  // The server detected an infinite loop while processing the request.
  INFINITE_LOOP: { code: 508, status: 'Loop Detected' },
  // Indicates that the client needs to authenticate to gain network access.
  NETWORK_AUTHENTICATION_REQUIRED: { code: 511, status: 'Network Authentication Required' }
};

const Status = {
  //------------------------------------------------------------------//
  // 100 Status Codes

  CONTINUE: codes.CONTINUE,
  PROCESSING: codes.PROCESSING,

  //------------------------------------------------------------------//
  // 200 Status Codes

  OK: codes.OK,
  CREATED: codes.CREATED,
  ACCEPTED: codes.ACCEPTED,
  EMPTY: codes.EMPTY,
  RESET: codes.RESET,
  PARTIAL: codes.PARTIAL,

  //------------------------------------------------------------------//
  // 300 Status Codes

  MOVED: codes.MOVED,
  FOUND: codes.FOUND,
  REDIRECT: codes.REDIRECT,
  CACHE: codes.CACHE,
  TEMPORARY: codes.TEMPORARY,
  PERMANENT: codes.PERMANENT,
  ABORT: codes.ABORT,

  //------------------------------------------------------------------//
  // 400 Status Codes

  BAD_REQUEST: codes.BAD_REQUEST,
  UNAUTHORIZED: codes.UNAUTHORIZED,
  FORBIDDEN: codes.FORBIDDEN,
  NOT_FOUND: codes.NOT_FOUND,
  BAD_METHOD: codes.BAD_METHOD,
  NOT_ACCEPTABLE: codes.NOT_ACCEPTABLE,
  REQUEST_TIMEOUT: codes.REQUEST_TIMEOUT,
  CONFLICT: codes.CONFLICT,
  GONE: codes.GONE,
  LENGTH_REQUIRED: codes.LENGTH_REQUIRED,
  TOO_LARGE: codes.TOO_LARGE,
  TOO_LONG: codes.TOO_LONG,
  UNSUPPORTED_TYPE: codes.UNSUPPORTED_TYPE,
  BAD_RANGE: codes.BAD_RANGE,
  BAD_EXPECTATION: codes.BAD_EXPECTATION,
  MISDIRECTED: codes.MISDIRECTED,
  UNPROCESSABLE: codes.UNPROCESSABLE,
  LOCKED: codes.LOCKED,
  BAD_DEPENDENCY: codes.BAD_DEPENDENCY,
  UPGRADE_REQUIRED: codes.UPGRADE_REQUIRED,
  BAD_PRECONDITION: codes.BAD_PRECONDITION,
  TOO_MANY: codes.TOO_MANY,
  HEADER_TOO_LARGE: codes.HEADER_TOO_LARGE,
  LEGAL_REASONS: codes.LEGAL_REASONS,

  //------------------------------------------------------------------//
  // 500 Status Codes

  ERROR: codes.ERROR,
  NOT_IMPLEMENTED: codes.NOT_IMPLEMENTED,
  BAD_GATEWAY: codes.BAD_GATEWAY,
  UNAVAILABLE: codes.UNAVAILABLE,
  RESPONSE_TIMEOUT: codes.RESPONSE_TIMEOUT,
  BAD_VERSION: codes.BAD_VERSION,
  INSUFFICIENT_STORAGE: codes.INSUFFICIENT_STORAGE,
  INFINITE_LOOP: codes.INFINITE_LOOP,
  NETWORK_AUTHENTICATION_REQUIRED: codes.NETWORK_AUTHENTICATION_REQUIRED,

  find(status: string) {
    return Object.values(codes).find(
      response => typeof response !== 'function' && response.status === status
    );
  },
  get(code: number) {
    return Object.values(codes).find(
      response => typeof response !== 'function' && response.code === code
    );
  }
};

export default Status;