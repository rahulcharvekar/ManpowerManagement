param location string = resourceGroup().location
param environmentName string
param containerAppName string
param registryServer string
param registryUsername string
@secure()
param registryPassword string
param containerImage string

// Database connection parameters
@secure()
param dbConnectionString string
@secure()
param dbUsername string
@secure()
param dbPassword string

// File storage parameters
param fileUploadDir string = '/app/uploads'

// Additional configuration
param minReplicas int = 1
param maxReplicas int = 10
param cpuRequest string = '0.5'
param memoryRequest string = '1Gi'

// Log Analytics Workspace for monitoring
resource logAnalytics 'Microsoft.OperationalInsights/workspaces@2022-10-01' = {
  name: '${environmentName}-logs'
  location: location
  properties: {
    sku: {
      name: 'PerGB2018'
    }
    retentionInDays: 30
  }
}

// Container Apps Environment
resource containerEnv 'Microsoft.App/managedEnvironments@2023-05-01' = {
  name: environmentName
  location: location
  properties: {
    appLogsConfiguration: {
      destination: 'log-analytics'
      logAnalyticsConfiguration: {
        customerId: logAnalytics.properties.customerId
        sharedKey: logAnalytics.listKeys().primarySharedKey
      }
    }
  }
}

// Container App with Production Configuration
resource containerApp 'Microsoft.App/containerApps@2023-05-01' = {
  name: containerAppName
  location: location
  properties: {
    managedEnvironmentId: containerEnv.id
    configuration: {
      ingress: {
        external: true
        targetPort: 8080
        allowInsecure: false
        traffic: [
          {
            latestRevision: true
            weight: 100
          }
        ]
      }
      registries: [
        {
          server: registryServer
          username: registryUsername
          passwordSecretRef: 'acr-secret'
        }
      ]
      secrets: [
        {
          name: 'acr-secret'
          value: registryPassword
        }
        {
          name: 'db-connection-string'
          value: dbConnectionString
        }
        {
          name: 'db-username'
          value: dbUsername
        }
        {
          name: 'db-password'
          value: dbPassword
        }
      ]
    }
    template: {
      revisionSuffix: 'v${uniqueString(utcNow())}'
      scale: {
        minReplicas: minReplicas
        maxReplicas: maxReplicas
        rules: [
          {
            name: 'http-scaling-rule'
            http: {
              metadata: {
                concurrentRequests: '10'
              }
            }
          }
        ]
      }
      containers: [
        {
          name: containerAppName
          image: containerImage
          resources: {
            cpu: json(cpuRequest)
            memory: memoryRequest
          }
          env: [
            {
              name: 'SPRING_PROFILES_ACTIVE'
              value: 'prod'
            }
            {
              name: 'SERVER_PORT'
              value: '8080'
            }
            {
              name: 'DB_URL'
              secretRef: 'db-connection-string'
            }
            {
              name: 'DB_USERNAME'
              secretRef: 'db-username'
            }
            {
              name: 'DB_PASSWORD'
              secretRef: 'db-password'
            }
            {
              name: 'FILE_UPLOAD_DIR'
              value: fileUploadDir
            }
            {
              name: 'JAVA_OPTS'
              value: '-Xms512m -Xmx768m -XX:+UseG1GC -XX:MaxGCPauseMillis=200'
            }
            {
              name: 'TZ'
              value: 'UTC'
            }
          ]
          probes: [
            {
              type: 'Liveness'
              httpGet: {
                path: '/actuator/health'
                port: 8080
                scheme: 'HTTP'
              }
              initialDelaySeconds: 60
              periodSeconds: 30
              timeoutSeconds: 10
              failureThreshold: 3
            }
            {
              type: 'Readiness'
              httpGet: {
                path: '/actuator/health/readiness'
                port: 8080
                scheme: 'HTTP'
              }
              initialDelaySeconds: 30
              periodSeconds: 10
              timeoutSeconds: 5
              failureThreshold: 3
            }
          ]
          volumeMounts: [
            {
              volumeName: 'uploads-volume'
              mountPath: fileUploadDir
            }
          ]
        }
      ]
      volumes: [
        {
          name: 'uploads-volume'
          storageType: 'EmptyDir'
        }
      ]
    }
  }
}

// Outputs
output fqdn string = containerApp.properties.configuration.ingress.fqdn
output containerAppId string = containerApp.id
output logAnalyticsWorkspaceId string = logAnalytics.id
