# Lambda X-Ray

```ts
// Support capturing HTTP requests in X-Ray.
import * as AWSXRay from "aws-xray-sdk";
AWSXRay.captureHTTPsGlobal(require("http"), true);
AWSXRay.captureHTTPsGlobal(require("https"), true);
AWSXRay.capturePromise();

// Capture AWS SDK calls in X-Ray.
const AWS = AWSXRay.captureAWS(require("aws-sdk"));

// Other dependencies.
import { APIGatewayProxyEvent, Context, Handler } from "aws-lambda";
import { Subsegment } from "aws-xray-sdk";
import { metricScope, Unit } from "aws-embedded-metrics";

const xrayScope = <
  TEvent,
  TResult,
  F extends (segment: Subsegment) => Handler<TEvent, TResult>
>(
  fn: F
): Handler<TEvent, TResult> =>
  AWSXRay.captureAsyncFunc("xray", (segment) => {
    if (!segment) {
      throw new Error("xrayLambda: subsegment not created");
    }
    try {
      return fn(segment);
    } finally {
      if (!segment.isClosed()) {
        segment.close();
      }
    }
  });


export const handler = xrayScope((segment) =>
  metricScope((metrics) => (event: APIGatewayProxyEvent, context: Context) => {
    segment.addAnnotation("source", "apiHandler");
    metrics.putMetric("count", 1, Unit.Count)
    console.log(event);
    console.log(context);
  })
);
```
