import { Request } from "express"

export interface UserRequiredInRequest extends Request {
  user?: {userId: string}
};

export interface NewTokensReturnType{
  newAccessToken: string,
  newRefreshToken: string
}