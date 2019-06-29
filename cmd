aws cloudformation create-stack --stack-name my-app-pipeline \
                                --template-url https://samhitcloud-pipeline.s3.amazonaws.com/cloudFormation.yaml \
                                --parameters ParameterKey=RepositoryOwner,ParameterValue=samhithaporeddy \
                                             ParameterKey=RepositoryName,ParameterValue=Template \
                                             
                                --capabilities=CAPABILITY_IAM




aws cloudformation create-stack --stack-name my-app-pipeline --template-url https://poreddy-pipeline.s3.amazonaws.com/cloudformationcc.yaml --parameters ParameterKey=RepositoryOwner,ParameterValue=samhithaporeddy ParameterKey=RepositoryName,ParameterValue=testingGithub ParameterKey=RepositoryBranch,ParameterValue=master  --capabilities=CAPABILITY_IAM