import { CfnOutput, Duration, Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
// ec2 パッケージをインポート
import * as ec2 from "aws-cdk-lib/aws-ec2";

import { readFileSync } from "fs";

export class AwsCdkWorkshopTypescriptStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

	// VPC を作成
	const vpc = new ec2.Vpc(this, "BlogVpc", {
		ipAddresses: ec2.IpAddresses.cidr('10.0.0.0/16'),
	});

	// EC2 インスタンスの宣言を準備
	const webServer1 = new ec2.Instance(this, "WordpressServer1", {
		// EC2 を起動する VPC を設定
		vpc,
		// インスタンスタイプを設定
		instanceType: ec2.InstanceType.of(ec2.InstanceClass.T2, ec2.InstanceSize.MICRO),
		// AmazonLinuxImage インスタンスを生成し、AMI を設定
		machineImage: new ec2.AmazonLinuxImage({
			generation: ec2.AmazonLinuxGeneration.AMAZON_LINUX_2,
		}),
		// EC2 インスタンスを配置するサブネットを設定
		vpcSubnets: { subnetType: ec2.SubnetType.PUBLIC },
	});

	// user-data.sh を読み込み、変数に格納
	const script = readFileSync("./lib/resources/user-data.sh", "utf8");
	webServer1.addUserData(script);

	// port 80, 全ての IP アドレスからのアクセスを許可
	webServer1.connections.allowFromAnyIpv4(ec2.Port.tcp(80));

	// EC2 インスタンスアクセス用の IP アドレスを出力
    new CfnOutput(this, "WordpressServer1PublicIPAddress", {
      value: `http://${webServer1.instancePublicIp}`,
    });
  }
}
