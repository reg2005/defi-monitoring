import { DateTime } from 'luxon'
import ms from 'ms'
import stringify from 'fast-json-stable-stringify'
import _ from 'lodash'
import glob from 'glob'

export const getFilesFromDirRecursive = async function (
  src: string,
  options = {}
): Promise<string[]> {
  return new Promise((resolve) => {
    const files = glob.sync(src, options)
    resolve(files)
  })
}

type ServiceNamesType = 'TGSendMessage'
export class ElkLogger {
  public static log(service_name: ServiceNamesType, message: string, payload: any = {}) {
    const payloadObject = _.isArray(payload) || typeof payload === 'string' ? { payload } : payload
    const logObject = {
      service_name,
      logger_type: 'SERVICE_LOGGER',
      message,
      log_time: DateTime.local().toString(),
    }

    console.log(
      stringify({
        ...payloadObject,
        ...logObject,
      })
    )
  }

  public static error(service_name: ServiceNamesType, message: string, err: any = {}) {
    console.error(
      stringify({
        error_name: err?.name,
        error_message: err?.message,
        error_trace: err?.stack,
        error_stderr: err?.stderr,
        logger_type: 'SERVICE_LOGGER',
        service_name,
        message,
        log_time: DateTime.local().toString(),
      })
    )
  }
}

export const sleep = (milliseconds: number | string) => {
  if (typeof milliseconds === 'string') {
    milliseconds = ms(milliseconds)
  }
  if (milliseconds === Infinity) {
    return new Promise((res) => {})
  }
  return new Promise((res) => setTimeout(res, milliseconds as number))
}
