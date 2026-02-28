package com.myorg;

import software.amazon.awscdk.Stack;
import software.amazon.awscdk.StackProps;
import software.amazon.awscdk.services.iam.*;
import software.constructs.Construct;

import java.util.Map;

public class OidcRoleStack extends Stack {
    public OidcRoleStack(final Construct scope, final String id, final StackProps props) {
        super(scope, id, props);

        OpenIdConnectProvider githubProvider = OpenIdConnectProvider.Builder.create(this, "GithubOidcProvider")
                .url("https://token.actions.githubusercontent.com")
                .clientIds(java.util.Arrays.asList("sts.amazonaws.com"))
                // GitHub standard thumbprints
                .thumbprints(java.util.Arrays.asList("6938fd4d98bab03faadb97b34396831e3780aea1",
                        "1c58a3a8518e8759bf075b76b750d4f2df264fcd"))
                .build();

        Role githubActionsRole = Role.Builder.create(this, "GithubActionsDeployRole")
                .roleName("GitHubActionsDeployRole")
                .assumedBy(new WebIdentityPrincipal(githubProvider.getOpenIdConnectProviderArn(), Map.of(
                        "StringLike", Map.of(
                                "token.actions.githubusercontent.com:sub", "repo:Vikrantgupta01/hospomate:*"),
                        "StringEquals", Map.of(
                                "token.actions.githubusercontent.com:aud", "sts.amazonaws.com"))))
                .build();

        // Granting Admin Access strictly for CDK deployments and AWS resource creation
        // via this GitHub Repo.
        githubActionsRole.addManagedPolicy(ManagedPolicy.fromAwsManagedPolicyName("AdministratorAccess"));
    }
}
