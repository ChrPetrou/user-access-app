// HTTP status codes used by services and route handlers.
// An enum (not a const object) so members can be used as types: `status: HttpStatus.Forbidden | HttpStatus.Conflict`.
export enum HttpStatus {
  Ok = 200,
  Created = 201,
  BadRequest = 400,
  Unauthorized = 401,
  Forbidden = 403,
  NotFound = 404,
  Conflict = 409
}

// status names for service results: `status: StatusName<'Forbidden' | 'Conflict'>` → autocompletes only those names.
// Route handlers convert with HttpStatus[result.status].
export type StatusName<K extends keyof typeof HttpStatus = keyof typeof HttpStatus> = K;
