import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Context,
} from "aws-lambda";
import { metricScope, Unit } from "aws-embedded-metrics";
import { xrayScope } from "../../../xray";
import axios from "axios";
import log from "../../../logger";
import EventBridge from "aws-sdk/clients/eventbridge";

export const handler = xrayScope<APIGatewayProxyEvent, APIGatewayProxyResult>(
  (segment) =>
    metricScope(
      (metrics) => async (
        _e: APIGatewayProxyEvent,
        _c: Context
      ): Promise<APIGatewayProxyResult> => {
        log.info("hello/get starting");
        segment.addAnnotation("source", "apiHandler");
        metrics.putMetric("count", 1, Unit.Count);
        try {
          await axios.get("http://httpstat.us/500");
        } catch (err) {
          log.warn("httpstat.us gave error, as expected", { status: 500 });
          // {"status":500,"level":"warn","message":"httpstat.us gave error, as expected","timestamp":"2020-09-01T18:33:30.296Z"}
        }
        await axios.get("https://jsonplaceholder.typicode.com/todos/1");
        metrics.putMetric("exampleApiCallsMade", 2);
        await putEvent();
        return {
          statusCode: 200,
          body: "World!",
        };
      }
    )
);

const putEvent = async () => {
  // Send a message to EventBridge to trace through multiple Lambdas.
  const eventBus = new EventBridge();
  const params = {
    Entries: [
      {
        Source: "cloudwatch-embedded-metric-example",
        DetailType: "exampleEvent",
        Detail: JSON.stringify({
          message: "Hello...",
        }),
      },
    ],
  };
  await eventBus.putEvents(params).promise();
};
