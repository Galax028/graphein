import { AcceptedFileTypes } from "@/utils/types/common";

export async function generateFileUploadURL(
  id: string,
  fileName: string,
  fileType: AcceptedFileTypes,
  fileSize: number
) {
  console.warn(`[SKPF] FETCH : POST /orders/${id}/files`);

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_PATH}/orders/2e86a946-0cb9-4831-aa77-9b780fe601cb/files`,
    {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        filename: fileName,
        filetype: fileType,
        filesize: fileSize,
      }),
    }
  );

  // EXAMPLE RESPONSE:
  //
  // {
  //   "success": true,
  //     "timestamp": "2025-06-2x5T08:52:10.608085241Z",
  //     "message": null,
  //     "data": {
  //       "id": "5ed8d3af-e020-4d25-a038-654f98fefb29",
  //       "objectKey": "25c3add2176633bd5e8af92e8980ebff",
  //       "uploadUrl": "https://7625945536e42a812439c01fe96f0361.r2.cloudflarestorage.com/dev-sk-online-printing/25c3add2176633bd5e8af92e8980ebff.pdf
  //                      ?X-Amz-Algorithm=AWS4-HMAC-SHA256
  //                      &X-Amz-Credential=8ee85e9bd9dc10b874b9e343c469920e%2F20250625%2Fauto%2Fs3%2Faws4_request
  //                      &X-Amz-Date=20250625T085210Z
  //                      &X-Amz-Expires=806
  //                      &X-Amz-SignedHeaders=content-length%3Bcontent-type%3Bhost
  //                      &X-Amz-Signature=55601a25a8f0a979ecaf6678d15bc15418c420dad36223e8136d110b46092058"
  //     },
  //     "error": null,
  //   "pagination": null
  // }

  const data = await res.json();

  if (res.ok) {
    return data.data;
  }
}
