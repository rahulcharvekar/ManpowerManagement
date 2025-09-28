package com.example.paymentreconciliation.config;

import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.info.Contact;
import io.swagger.v3.oas.annotations.info.Info;
import io.swagger.v3.oas.annotations.info.License;
import io.swagger.v3.oas.annotations.servers.Server;
import io.swagger.v3.oas.annotations.servers.ServerVariable;
import org.slf4j.Logger;
import com.example.paymentreconciliation.utilities.logger.LoggerFactoryProvider;
import org.springframework.context.annotation.Configuration;

@Configuration
@OpenAPIDefinition(
        info = @Info(
                title = "Payment Reconciliation API",
                version = "v1",
                description = "REST API for managing worker, employer, and board payment records.",
                contact = @Contact(name = "Payment Ops", email = "ops@example.com"),
                license = @License(name = "Apache 2.0", url = "https://www.apache.org/licenses/LICENSE-2.0")
        ),
        servers = {
                @Server(url = "http://localhost:8080", description = "Local"),
                @Server(
                        url = "https://{containerApp}.delightfulsand-562b205d.westus2.azurecontainerapps.io/",
                        description = "Azure Container App",
                        variables = {
                                @ServerVariable(
                                        name = "containerApp",
                                        description = "Container App default hostname prefix",
                                        defaultValue = "payment-reconciliation"
                                )
                        }
                )
        }
)
public class OpenApiConfig {

    private static final Logger log = LoggerFactoryProvider.getLogger(OpenApiConfig.class);

    public OpenApiConfig() {
        log.info("OpenAPI configuration initialized");
    }
}
