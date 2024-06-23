import * as AWS from 'aws-sdk'
const AWSXRay = require('aws-xray-sdk')
import { createLogger } from '../../utils/logger'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'

const logger = createLogger('Attach file storage')
const XAWS = AWSXRay.captureAWS(AWS)

// TODO: Implement the fileStogare logic
export class AttachmentUtils {
  constructor(
    private readonly docClient: DocumentClient = createDynamoDBClient(),
    private readonly todosTable = process.env.TODOS_TABLE
  ) {}

  async updateAttachmentUrl(
    todoId: string,
    userId: string,
    url: string
  ): Promise<string> {
    logger.info('Update attachment url of todo')

    await this.docClient
      .update({
        TableName: this.todosTable,
        Key: {
          todoId: todoId,
          userId: userId
        },
        UpdateExpression: 'set attachmentUrl = :url',
        ExpressionAttributeValues: {
          ':url': url
        }
      })
      .promise()

    return url
  }
}

function createDynamoDBClient() {
  if (process.env.IS_OFFLINE) {
    logger.info('Creating a local DynamoDB instance')

    return new XAWS.DynamoDB.DocumentClient({
      region: 'localhost',
      endpoint: 'http://localhost:8000'
    })
  }
  logger.info('DynamoDB instance already exist')
  return new XAWS.DynamoDB.DocumentClient()
}
