import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
// ec2 パッケージをインポート
import * as ec2 from "aws-cdk-lib/aws-ec2";
// rds のパッケージを import
import * as rds from "aws-cdk-lib/aws-rds";
// elb のパッケージを import
import * as elbv2 from "aws-cdk-lib/aws-elasticloadbalancingv2";
import * as targets from "aws-cdk-lib/aws-elasticloadbalancingv2-targets";

// 自作コンストラクタを import
import { WebServerInstance } from "./constructs/web-server-instance";

export class AwsCdkWorkshopTypescriptStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

	// VPC を作成
	const vpc = new ec2.Vpc(this, "BlogVpc", {
		ipAddresses: ec2.IpAddresses.cidr('10.0.0.0/16'),
	});

	// 新しく作成したコンストラクトを使用してインスタンスを宣言
	const webServer1 = new WebServerInstance(this, "WordpressServer1", {
		vpc,
	});

	// 2つ目のインスタンスを宣言
	const webServer2 = new WebServerInstance(this, "WordpressServer2", {
		vpc,
	});

	// RDS のインスタンスを宣言
	const dbServer = new rds.DatabaseInstance(this, "WordpressDB", {
		vpc,
		// DatabaseInstanceEngine クラスを利用してデータベースエンジンを設定
		engine: rds.DatabaseInstanceEngine.mysql({version: rds.MysqlEngineVersion.VER_8_0_31 }),
		// RDS DB インスタンスのインスタンスタイプを設定
		instanceType: ec2.InstanceType.of(ec2.InstanceClass.T2, ec2.InstanceSize.SMALL),
		// RDS DB インスタンスのデータベース名を設定
		databaseName: "wordpress",
	    // multiAZ を true へ
        multiAz: true,
	});

	// Web サーバーから RDS DB サーバーへのアクセスを許可
	dbServer.connections.allowDefaultPortFrom(webServer1.instance);

	const alb = new elbv2.ApplicationLoadBalancer(this, "LoadBalancer", {
		vpc,
		internetFacing: true,
	});

	const listener = alb.addListener("Listener", {
		port: 80,
	});

	listener.addTargets("ApplicationFleet", {
		port: 80,
		targets: [
		  new targets.InstanceTarget(webServer1.instance, 80),
		  // ターゲットに 2 台目のインスタンスを追加
		  new targets.InstanceTarget(webServer2.instance, 80)
		],
		healthCheck: {
			path: "/wp-includes/images/blank.gif",
		},
	});

	webServer1.instance.connections.allowFrom(alb, ec2.Port.tcp(80));
	webServer2.instance.connections.allowFrom(alb, ec2.Port.tcp(80));
  }
}
