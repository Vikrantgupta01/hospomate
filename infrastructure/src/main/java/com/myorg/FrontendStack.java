package com.myorg;

import software.amazon.awscdk.RemovalPolicy;
import software.amazon.awscdk.Stack;
import software.amazon.awscdk.StackProps;
import software.amazon.awscdk.services.cloudfront.AllowedMethods;
import software.amazon.awscdk.services.cloudfront.BehaviorOptions;
import software.amazon.awscdk.services.cloudfront.CachePolicy;
import software.amazon.awscdk.services.cloudfront.Distribution;
import software.amazon.awscdk.services.cloudfront.OriginProtocolPolicy;
import software.amazon.awscdk.services.cloudfront.OriginRequestPolicy;
import software.amazon.awscdk.services.cloudfront.ViewerProtocolPolicy;
import software.amazon.awscdk.services.cloudfront.origins.LoadBalancerV2Origin;
import software.amazon.awscdk.services.cloudfront.origins.S3Origin;
import software.amazon.awscdk.services.elasticloadbalancingv2.IApplicationLoadBalancer;
import software.amazon.awscdk.services.s3.BlockPublicAccess;
import software.amazon.awscdk.services.s3.Bucket;
import software.constructs.Construct;

public class FrontendStack extends Stack {
        public FrontendStack(final Construct scope, final String id, final IApplicationLoadBalancer alb,
                        final StackProps props) {
                super(scope, id, props);

                Bucket frontendBucket = Bucket.Builder.create(this, "FrontendBucket")
                                .blockPublicAccess(BlockPublicAccess.BLOCK_ALL)
                                .removalPolicy(RemovalPolicy.DESTROY)
                                .autoDeleteObjects(true)
                                .build();

                Distribution distribution = Distribution.Builder.create(this, "FrontendDistribution")
                                .defaultBehavior(BehaviorOptions.builder()
                                                .origin(S3Origin.Builder.create(frontendBucket).build())
                                                .viewerProtocolPolicy(ViewerProtocolPolicy.REDIRECT_TO_HTTPS)
                                                .build())
                                .additionalBehaviors(java.util.Map.of(
                                                "/api/*", BehaviorOptions.builder()
                                                                .origin(LoadBalancerV2Origin.Builder.create(alb)
                                                                                .protocolPolicy(OriginProtocolPolicy.HTTP_ONLY)
                                                                                .build())
                                                                .viewerProtocolPolicy(ViewerProtocolPolicy.HTTPS_ONLY)
                                                                .allowedMethods(AllowedMethods.ALLOW_ALL)
                                                                .cachePolicy(CachePolicy.CACHING_DISABLED)
                                                                .originRequestPolicy(OriginRequestPolicy.ALL_VIEWER)
                                                                .build()))
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
