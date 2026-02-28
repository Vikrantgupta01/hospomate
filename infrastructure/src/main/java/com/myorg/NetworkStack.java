package com.myorg;

import software.amazon.awscdk.Stack;
import software.amazon.awscdk.StackProps;
import software.amazon.awscdk.services.ec2.IVpc;
import software.amazon.awscdk.services.ec2.SubnetConfiguration;
import software.amazon.awscdk.services.ec2.SubnetType;
import software.amazon.awscdk.services.ec2.Vpc;
import software.constructs.Construct;

public class NetworkStack extends Stack {
    private final IVpc vpc;

    public NetworkStack(final Construct scope, final String id, final StackProps props) {
        super(scope, id, props);

        this.vpc = Vpc.Builder.create(this, "HospoMateVpc")
                .maxAzs(2) // High availability
                .subnetConfiguration(java.util.Arrays.asList(
                        SubnetConfiguration.builder()
                                .subnetType(SubnetType.PUBLIC)
                                .name("Public-Subnet")
                                .build(),
                        SubnetConfiguration.builder()
                                .subnetType(SubnetType.PRIVATE_WITH_EGRESS)
                                .name("Private-Subnet")
                                .build()))
                .natGateways(1) // Keep costs lower by having just 1 NAT Gateway
                .build();
    }

    public IVpc getVpc() {
        return vpc;
    }
}
