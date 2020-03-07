'use strict';

module.exports.webscrape = (event, context) => {
    const time = new Date();
    console.log(`Test your cron function "${context.functionName}" ran at ${time}`);
};

// 'use strict';
//
// module.exports.webscrape = async event => {
//   return {
//     statusCode: 200,
//     body: JSON.stringify(
//       {
//         message: 'Go Serverless v1.0! Your function executed successfully!',
//         input: event,
//       },
//       null,
//       2
//     ),
//   };
//
//   // Use this code if you don't use the http event with the LAMBDA-PROXY integration
//   // return { message: 'Go Serverless v1.0! Your function executed successfully!', event };
// };
