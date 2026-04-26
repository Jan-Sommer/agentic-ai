# Team Setup
We offer two products: SCX (Supply Chain Management) and SMP (Sustainability Management Platform). both products have a streamaligned team software engineering team and a complicated subsystem team in form of a machine learning engineering team, which service one or multiple services in the realm of machine learning.

There is a central infrastructure team on top, which acts as the platform team as described by Team Topology. In addition we have a central data engineering team, which best fit into the complicated subsystem category, because the team takes care of data pipelines and the implementation of client systems.

## Streamaligned Teams
The streamaligned teams of the products consists of software engineers, who are mainly working with web technologies: 
- Node.js
- Typescript
- PostgreSQL
- MongoDB
- Angular

Each team has 3-5 team members and works with the complicated subsystem teams and the platform teams. Other roles within the teams: product owner and UI/UX designer.

## Complicated Subsystem Teams
There are several complicated subsystem teams, which are providing services with dedicated functionality for the products. 

For the SCX product the complicated subsystem team consists of machine learning engineers, which offer a service for demand forecasting.

The SMP product is also supported by a complicates subsystem team consisting of machine learning engineers, which offer the following services:
- emission factor matching based on a given input, which tries to find the best matching emission factor coming from emission factor databases like EcoInvent
- data extraction from documents - an unformated document (e.g. a PDF) can be uploaded and the services extracts relevant data (for sustainability accounting) from the document

The last complicated subsystem team consists of data engineers, which build data pipelines extracting, transforming and providing client data and offering it to the products. They also take care of connecting to client systems (e.g. SAP).

## Platform Team
The platform team provides the infrastructure for both products. The whole infrastructure runs on Azure and the services are hosted on a Kubernetes Cluster. The Platform teams provides the configuration and the setup of these services and support with deploying the services of the product teams to the environments.

The platform team also takes care of the monitoring stack (Prometheus, Loki, Grafana, OpenTelemetry) and of other shared services like: Keycloak, Flagsmith, Redis etc.

