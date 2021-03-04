import * as AWSXRay from "aws-xray-sdk";
import { Context } from "aws-lambda";
import { Subsegment } from "aws-xray-sdk";

export type Handler<TEvent, TResult> = (
  event: TEvent,
  context: Context
) => Promise<void | TResult>;

export const xrayScope = <
  TEvent,
  TResult,
  F extends (segment: Subsegment) => Handler<TEvent, TResult> = (
    s: Subsegment
  ) => Handler<TEvent, TResult>
>(
  fn: F
): Handler<TEvent, TResult> => async (e, c) => {
  AWSXRay.captureAWS(require("aws-sdk"));
  AWSXRay.captureHTTPsGlobal(require("http"), true);
  AWSXRay.captureHTTPsGlobal(require("https"), true);
  AWSXRay.capturePromise();
  const segment = (
    AWSXRay.getSegment() || new AWSXRay.Segment("lambda")
  ).addNewSubsegment("handler");
  try {
    return await fn(segment)(e, c);
  } finally {
    if (!segment.isClosed()) {
      segment.close();
    }
  }
};
