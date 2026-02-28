package com.myorg;

import software.amazon.awscdk.Duration;
import software.amazon.awscdk.Stack;
import software.amazon.awscdk.StackProps;
import software.amazon.awscdk.services.ec2.IVpc;
import software.amazon.awscdk.services.ecr.Repository;
import software.amazon.awscdk.services.ecs.*;
import software.amazon.awscdk.services.ecs.patterns.ApplicationLoadBalancedFargateService;
import software.amazon.awscdk.services.ecs.patterns.ApplicationLoadBalancedTaskImageOptions;
import software.amazon.awscdk.services.secretsmanager.ISecret;
import software.constructs.Construct;

import java.util.Map;

public class BackendStack extends Stack {

    public BackendStack(final Construct scope, final String id, final IVpc vpc, final ISecret dbSecret,
            final StackProps props) {
        super(scope, id, props);

        Repository repository = Repository.Builder.create(this, "BackendRepo")
                .repositoryName("hospomate-backend")
                .build();

        Cluster cluster = Cluster.Builder.create(this, "HospoCluster")
                .vpc(vpc)
                .clusterName("hospomate-cluster")
                .build();

        ApplicationLoadBalancedFargateService fargateService = ApplicationLoadBalancedFargateService.Builder
                .create(this, "HospoFargateService")
                .cluster(cluster)
                .cpu(512)
                .memoryLimitMiB(1024)
                .desiredCount(1)
                .taskImageOptions(ApplicationLoadBalancedTaskImageOptions.builder()
                        .image(ContainerImage.fromRegistry("amazon/amazon-ecs-sample"))
                        .containerPort(8080)
                        .environment(Map.of(
                                "SPRING_PROFILES_ACTIVE", "prod"))
                        .secrets(Map.of(
                                "DB_PASSWORD",
                                software.amazon.awscdk.services.ecs.Secret.fromSecretsManager(dbSecret, "password"),
                                "DB_USERNAME",
                                software.amazon.awscdk.services.ecs.Secret.fromSecretsManager(dbSecret, "username"),
                                "DB_HOST",
                                software.amazon.awscdk.services.ecs.Secret.fromSecretsManager(dbSecret, "host"),
                                "DB_PORT",
                                software.amazon.awscdk.services.ecs.Secret.fromSecretsManager(dbSecret, "port")))
                        .build())
                .publicLoadBalancer(true)
                .build();

        repository.grantPull(fargateService.getTaskDefinition().getExecutionRole());

        fargateService.getTargetGroup()
                .configureHealthCheck(software.amazon.awscdk.services.elasticloadbalancingv2.HealthCheck.builder()
                        .path("/actuator/health")
                        .interval(Duration.seconds(60))
                        .build());
    }
}
