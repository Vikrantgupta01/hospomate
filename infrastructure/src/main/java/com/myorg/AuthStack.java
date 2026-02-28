package com.myorg;

import software.amazon.awscdk.Stack;
import software.amazon.awscdk.StackProps;
import software.amazon.awscdk.services.cognito.OAuthSettings;
import software.amazon.awscdk.services.cognito.UserPool;
import software.amazon.awscdk.services.cognito.UserPoolClient;
import software.constructs.Construct;

public class AuthStack extends Stack {
    private final UserPool userPool;
    private final UserPoolClient userPoolClient;

    public AuthStack(final Construct scope, final String id, final StackProps props) {
        super(scope, id, props);

        this.userPool = UserPool.Builder.create(this, "HospoMateUserPool")
                .userPoolName("HospoMateUsers")
                .selfSignUpEnabled(true)
                .signInAliases(software.amazon.awscdk.services.cognito.SignInAliases.builder()
                        .email(true)
                        .username(false)
                        .build())
                .autoVerify(software.amazon.awscdk.services.cognito.AutoVerifiedAttrs.builder()
                        .email(true)
                        .build())
                .build();

        this.userPoolClient = UserPoolClient.Builder.create(this, "HospoMateUserClient")
                .userPool(userPool)
                .userPoolClientName("HospoMateReactApp")
                .generateSecret(false) // Not needed for SPA (React)
                // .oAuth(OAuthSettings.builder().build())
                .build();
    }

    public UserPool getUserPool() {
        return userPool;
    }

    public UserPoolClient getUserPoolClient() {
        return userPoolClient;
    }
}
