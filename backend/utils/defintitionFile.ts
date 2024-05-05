import { Request } from "express"

export interface UserRequiredInRequest extends Request {
  user?: {userId: string}
};

export interface NewTokensReturnType{
  newAccessToken: string,
  newRefreshToken: string
}

export const resetPasswordTimeoutDurationInMinutes = 5;
export const registerationTimeoutDurationInMinutes = 5;