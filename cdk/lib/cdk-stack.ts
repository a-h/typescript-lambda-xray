import * as cdk from "@aws-cdk/core";
import * as apigw from "@aws-cdk/aws-apigateway";
import * as lambda from "@aws-cdk/aws-lambda";
import * as path from "path";
import * as lambdaNode from "@aws-cdk/aws-lambda-nodejs";
import { EventBus } from "@aws-cdk/aws-events";

export class CdkStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const helloGetHandler = new lambdaNode.NodejsFunction(
      this,
      "helloGetHandler",
      {
        runtime: lambda.Runtime.NODEJS_14_X,
        entry: path.join(__dirname, "../../api/handlers/http/hello/get.ts"),
        handler: "handler",
        memorySize: 1024,
        description: `Build time: ${new Date().toISOString()}`,
        tracing: lambda.Tracing.ACTIVE,
        timeout: cdk.Duration.seconds(15),
      }
    );
    EventBus.grantPutEvents(helloGetHandler);

    const api = new apigw.LambdaRestApi(this, "lambdaXRayExample", {
      handler: helloGetHandler,
      proxy: false,
      deployOptions: {
        dataTraceEnabled: true,
        tracingEnabled: true,
      },
    });

    api.root
      .addResource("hello")
      .addMethod("GET", new apigw.LambdaIntegration(helloGetHandler));
  }
}
