package com.myorg;

import software.amazon.awscdk.App;
import software.amazon.awscdk.StackProps;

public class InfrastructureApp {
    public static void main(final String[] args) {
        App app = new App();

        NetworkStack networkStack = new NetworkStack(app, "NetworkStack", StackProps.builder().build());

        DataStack dataStack = new DataStack(app, "DataStack", networkStack.getVpc(), StackProps.builder().build());
        dataStack.addDependency(networkStack);

        AuthStack authStack = new AuthStack(app, "AuthStack", StackProps.builder().build());

        BackendStack backendStack = new BackendStack(app, "BackendStack", networkStack.getVpc(),
                dataStack.getDbSecret(), StackProps.builder().build());
        backendStack.addDependency(dataStack);

        FrontendStack frontendStack = new FrontendStack(app, "FrontendStack", StackProps.builder().build());

        OidcRoleStack oidcRoleStack = new OidcRoleStack(app, "OidcRoleStack", StackProps.builder().build());

        app.synth();
    }
}
