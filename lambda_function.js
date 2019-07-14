var snowflake = require('snowflake-sdk') 
var AWS = require('aws-sdk') 
 
exports.handler =  async (event) => { 
    var userNumber = event['queryStringParameters']['user_number'] 
    console.log("This is just for testing"); 
    // Create a Secrets Manager client 
    var client = new AWS.SecretsManager({ 
        region: "us-west-2" 
    }); 
 
    var secretPromise = () => { 
        return new Promise((resolve,reject) => { 
            client.getSecretValue({SecretId: "snowflake_dev"}, function(err, data) { 
                if (err) { 
                    if (err.code === 'DecryptionFailureException') 
                    // Secrets Manager can't decrypt the protected secret text using the provided KMS key. 
                    // Deal with the exception here, and/or rethrow at your discretion. 
                    throw err; 
                    else if (err.code === 'InternalServiceErrorException') 
                    // An error occurred on the server side. 
                    // Deal with the exception here, and/or rethrow at your discretion. 
                    throw err; 
                    else if (err.code === 'InvalidParameterException') 
                    // You provided an invalid value for a parameter. 
                    // Deal with the exception here, and/or rethrow at your discretion. 
                    throw err; 
                    else if (err.code === 'InvalidRequestException') 
                    // You provided a parameter value that is not valid for the current state of the resource. 
                    // Deal with the exception here, and/or rethrow at your discretion. 
                    throw err; 
                    else if (err.code === 'ResourceNotFoundException') 
                    // We can't find the resource that you asked for.   
                    // Deal with the exception here, and/or rethrow at your discretion. 
                    throw err; 
                    reject(err) 
                } 
                else { 
                    resolve(JSON.parse(data.SecretString)) 
                } 
            }); 
        }); 
    } 
    var connectPromise = (secret) => { 
        var connection = snowflake.createConnection({ 
            account: 'veriskclaims', 
            username: secret.user, 
            password: secret.pass, 
            database: 'dev_dw_xactware', 
            schema: 'edw' 
        }) 
        return new Promise((resolve,reject) => { 
            connection.connect((err,conn)=>{ 
                if(err){ 
                    console.error('unable to connect: '+err.message) 
                    reject(err) 
                } else { 
                    console.log('Successfully connected as id: ' + connection.getId()) 
                    resolve(connection) 
                } 
            }) 
        }) 
    } 
    var executePromise = (connection) => { 
        return new Promise((resolve,reject) => { 
            connection.execute({ 
                sqlText: 
                    `select 
                        b.report_id id, 
                        a.report_title title, 
                        a.report_description desc 
                    from 
                        legacy_company_report a, 
                        legacy_adhoc_access_allowed b 
                    where a.legacy_company_report_id = b.report_id 
                    and b.user_number = :1`, 
                binds: [userNumber], 
                complete: (err,stmt,rows) => { 
                    if (err) { 
                        console.error('Failed to execute statement due to the following error: ' + err.message); 
                        reject(err) 
                    } else { 
                        console.log('Successfully executed statement: ' + stmt.getSqlText()); 
                        if(rows.length == 0){ 
                            var response = { 
                                statusCode: 400, 
                                body: '{"error": "No reports found"}' 
                            } 
                        } else { 
                            var response = { 
                                statusCode: 200, 
                                body: JSON.stringify(rows) 
                            } 
                        } 
                        connection.destroy() 
                        resolve(response) 
                    } 
                } 
            }) 
        }) 
    } 
 
 
 
    return  secretPromise().then(v => connectPromise(v)).then(v => executePromise(v)); 
 
}; 
 