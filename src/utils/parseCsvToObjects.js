import Papa from 'papaparse';

export default function parseCsvToObjects(file, headers, onSuccess, headerErrMsg = '') {
  const config = {
    header: true,
    skipEmptyLines: true,
    error: errorHandler,
    complete: successHandler(headers, onSuccess, headerErrMsg),
  };
  Papa.parse(file, config);
}

function errorHandler(err, _) {
  console.error(err);
  throw err;
}

function successHandler(headers, callback, headerErrMsg = '') {
  function handleSuccess(response, _) {
    const fields = response.meta.fields;
    if (!fields) throw new Error('Headers should have been enabled!');

    const validFields = headers.every(e => fields.includes(e));
    if (!validFields) {
      const errMsg = headerErrMsg ? headerErrMsg : 'Headers are incorrect!';
      throw new Error(errMsg);
    }

    const data = response.data;
    callback(data);
  }
  return handleSuccess;
}
