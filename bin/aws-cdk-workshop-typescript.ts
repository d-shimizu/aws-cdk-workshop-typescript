#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { AwsCdkWorkshopTypescriptStack } from '../lib/aws-cdk-workshop-typescript-stack';

const app = new cdk.App();
new AwsCdkWorkshopTypescriptStack(app, 'AwsCdkWorkshopTypescriptStack');
