package com.myorg;

import software.amazon.awscdk.Stack;
import software.amazon.awscdk.StackProps;
import software.amazon.awscdk.services.ec2.IVpc;
import software.amazon.awscdk.services.ec2.InstanceClass;
import software.amazon.awscdk.services.ec2.InstanceSize;
import software.amazon.awscdk.services.ec2.InstanceType;
import software.amazon.awscdk.services.ec2.BastionHostLinux;
import software.amazon.awscdk.services.rds.*;
import software.constructs.Construct;

public class DataStack extends Stack {
    private final DatabaseInstance database;

    public DataStack(final Construct scope, final String id, final IVpc vpc, final StackProps props) {
        super(scope, id, props);

        this.database = DatabaseInstance.Builder.create(this, "HospoDb")
                .engine(DatabaseInstanceEngine.postgres(PostgresInstanceEngineProps.builder()
                        .version(PostgresEngineVersion.VER_16)
                        .build()))
                .vpc(vpc)
                .vpcSubnets(software.amazon.awscdk.services.ec2.SubnetSelection.builder()
                        .subnetType(software.amazon.awscdk.services.ec2.SubnetType.PRIVATE_WITH_EGRESS)
                        .build())
                .instanceType(InstanceType.of(InstanceClass.T4G, InstanceSize.MICRO))
                .credentials(Credentials.fromGeneratedSecret("postgres"))
                .multiAz(false)
                .allocatedStorage(20)
                .databaseName("hospomate")
                .build();

        // Adds a secure jump box to allow SSM connections from local machine
        BastionHostLinux bastion = BastionHostLinux.Builder.create(this, "BastionHost")
                .vpc(vpc)
                .instanceType(InstanceType.of(InstanceClass.T3, InstanceSize.MICRO))
                .build();

        // Allows the jump box to talk to the database on the default PostgreSQL port
        this.database.getConnections().allowDefaultPortFrom(bastion);
    }

    public DatabaseInstance getDatabase() {
        return database;
    }

    public software.amazon.awscdk.services.secretsmanager.ISecret getDbSecret() {
        return database.getSecret();
    }
}
