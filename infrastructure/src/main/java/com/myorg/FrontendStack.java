package com.myorg;

import software.amazon.awscdk.RemovalPolicy;
import software.amazon.awscdk.Stack;
import software.amazon.awscdk.StackProps;
import software.amazon.awscdk.services.cloudfront.Distribution;
import software.amazon.awscdk.services.cloudfront.origins.S3Origin;
import software.amazon.awscdk.services.s3.BlockPublicAccess;
import software.amazon.awscdk.services.s3.Bucket;
import software.constructs.Construct;

public class FrontendStack extends Stack {
    public FrontendStack(final Construct scope, final String id, final StackProps props) {
        super(scope, id, props);

        Bucket frontendBucket = Bucket.Builder.create(this, "FrontendBucket")
                .blockPublicAccess(BlockPublicAccess.BLOCK_ALL)
                .removalPolicy(RemovalPolicy.DESTROY)
                .autoDeleteObjects(true)
                .build();

        Distribution distribution = Distribution.Builder.create(this, "FrontendDistribution")
                .defaultBehavior(software.amazon.awscdk.services.cloudfront.BehaviorOptions.builder()
                        .origin(S3Origin.Builder.create(frontendBucket).build())
                        .viewerProtocolPolicy(
                                software.amazon.awscdk.services.cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS)
                        .build())
                .defaultRootObject("index.html")
                .errorResponses(java.util.Arrays.asList(
                        software.amazon.awscdk.services.cloudfront.ErrorResponse.builder()
                                .httpStatus(404)
                                .responseHttpStatus(200)
                                .responsePagePath("/index.html")
                                .build(),
                        software.amazon.awscdk.services.cloudfront.ErrorResponse.builder()
                                .httpStatus(403)
                                .responseHttpStatus(200)
                                .responsePagePath("/index.html")
                                .build()))
                .build();
    }
}
