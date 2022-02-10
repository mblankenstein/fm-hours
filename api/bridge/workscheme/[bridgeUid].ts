/* eslint-disable camelcase */
import {VercelRequest, VercelResponse} from '@vercel/node';
import axios from 'axios';
import {validateParams} from '../../../lib/request';

interface WorkScheme {
  date: string;
  theoreticalHours: number;
  absenceHours: number;
  workHours: number;
  holiday: boolean;
}

interface ApiWorkScheme {
  absence_hours: number;
  date: string;
  holiday: 0 | 1;
  present_hours: number;
  theoretical_hours: number;
  work_hours: number;
}

interface WorkSchemeResponse {
  status: number;
  message: string;
  data: ApiWorkScheme[];
}

export default async function Workscheme(request: VercelRequest, response: VercelResponse) {
  try {
    validateParams(request, ['bridgeUid', 'date_from', 'date_to']);
  } catch (e) {
    return response.status(400).json({
      message: e.message,
    });
  }

  const {bridgeUid, date_from: dateFrom, date_to: dateTo} = request.query;

  try {
    const apiWorkScheme: ApiWorkScheme[] = await getWorkscheme(
      request.headers.cookie || '',
      bridgeUid,
      dateFrom,
      dateTo
    );

    const workScheme: WorkScheme[] = apiWorkScheme.map(ws => ({
      date: ws.date,
      theoreticalHours: ws.theoretical_hours,
      absenceHours: ws.absence_hours,
      workHours: ws.work_hours,
      holiday: !!ws.holiday,
    }));

    return response.json({
      data: workScheme,
    });
  } catch (e) {
    return response.status(e.response.status).json({
      message: e.message,
    });
  }
}

async function getWorkscheme(
  cookies: string,
  bridgeUid: string | string[],
  date_from: string | string[],
  date_to: string | string[]
): Promise<ApiWorkScheme[]> {
  const {data: response} = await axios.get<WorkSchemeResponse>(
    `https://bridge.hosted-tools.com/api/v1/users/${bridgeUid}/worktime`,
    {
      params: {
        date_from,
        date_to,
      },
      headers: {
        Cookie: cookies,
      },
    }
  );

  return response.data;
}
