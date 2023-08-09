import axios from 'axios';
import { Request, Response } from 'express';
import sendErrorResponse from '../utils/sendErrorResponse';

// 요청 바디 타입
interface RequestBody {
  copyType: string;
  primary: string;
  secondary: string;
  keyword: string;
  categoryId: number;
  emotionId: number;
  toneCd: string;
}

// 응답 바디 타입
interface ResponseItem {
  responseCopy: string;
}

type ResponseBody = ResponseItem[];

const sendRequest = async (req: Request, res: Response) => {
  try {
    const url = 'https://api.copykle.ai/api';

    const requestBody: RequestBody = req.body;

    const response = await axios.post<ResponseBody>(url, requestBody);

    res.status(200).json(response.data);
  } catch (error) {
    console.error('API 요청 에러', error);

    sendErrorResponse(res, 500, 'Internal Server Error');
  }
};

export { sendRequest };
