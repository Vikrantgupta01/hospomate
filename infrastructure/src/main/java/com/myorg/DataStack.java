package com.myorg;

import software.amazon.awscdk.Stack;
import software.amazon.awscdk.StackProps;
import software.amazon.awscdk.services.ec2.IVpc;
import software.amazon.awscdk.services.ec2.InstanceClass;
import software.amazon.awscdk.services.ec2.InstanceSize;
import software.amazon.awscdk.services.ec2.InstanceType;
import software.amazon.awscdk.services.rds.*;
import software.constructs.Construct;

public class DataStack extends Stack {
    private final DatabaseInstance database;

    public DataStack(final Construct scope, final String id, final IVpc vpc, final StackProps props) {
        super(scope, id, props);

        this.database = DatabaseInstance.Builder.create(this, "HospoDb")
                .engine(DatabaseInstanceEngine.postgres(PostgresInstanceEngineProps.builder()
                        .version(PostgresEngineVersion.VER_15_4)
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
    }

    public DatabaseInstance getDatabase() {
        return database;
    }

    public software.amazon.awscdk.services.secretsmanager.ISecret getDbSecret() {
        return database.getSecret();
    }
}
