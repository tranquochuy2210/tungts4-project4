import "source-map-support/register";

import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import * as middy from "middy";
import { cors, httpErrorHandler } from "middy/middlewares";

import { getAllTodos } from "../../helpers/bussinessLogic/todos";
import { getUserId } from "../utils";

// TODO: Get all TODO items for a current user
export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    // Write your code here
    const userId = getUserId(event);
    const limit = parseLimitParameter(event);
    const nextKey = parseNextKeyParameter(event);
    const todos = await getAllTodos(userId, limit, nextKey);

    return {
      statusCode: 200,
      body: JSON.stringify(todos),
    };
  }
);

const parseLimitParameter = (event: APIGatewayProxyEvent): number => {
  const limitString = parseQueryParameter(event, "limit");
  if (!limitString) {
    return 5;
  }
  return parseInt(limitString, 10);
};

const parseNextKeyParameter = (event: APIGatewayProxyEvent) => {
  const nextKeyStr = parseQueryParameter(event, "nextKey");
  if (!nextKeyStr) {
    return undefined;
  }
  const uriDecoded = decodeURIComponent(nextKeyStr);
  return JSON.parse(uriDecoded);
};

const parseQueryParameter = (
  event: APIGatewayProxyEvent,
  queryName: string
) => {
  if (!event.queryStringParameters) {
    return undefined;
  }
  return event.queryStringParameters[queryName];
};
handler.use(httpErrorHandler()).use(
  cors({
    credentials: true,
  })
);