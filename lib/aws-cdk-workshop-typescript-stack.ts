import { Duration, Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
// ec2 パッケージをインポート
import * as ec2 from "aws-cdk-lib/aws-ec2";

export class AwsCdkWorkshopTypescriptStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

	// VPC を作成
	const vpc = new ec2.Vpc(this, "BlogVpc", {
		ipAddresses: ec2.IpAddresses.cidr('10.0.0.0/16'),
	});
  }
}
