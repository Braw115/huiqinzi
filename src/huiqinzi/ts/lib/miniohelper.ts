import * as assert from "assert"
const Minio = require('minio')
import * as Promise from "bluebird"
import * as winston from "winston"

function handleResult(resolve: Function, reject: Function, err: Error, resp: any) {
    if (err)
        return reject(err)
    return resolve(resp)
}
interface IMinioOpt {
    endPoint: string
    port: number
    secure: boolean
    accessKey: string
    secretKey: string
}

export class MinioHelper {
    private static instance: MinioHelper
    private minioClient: any
    private constructor(opt: IMinioOpt) {
        this.minioClient = new Minio.Client(opt)
    }

    public static initialize(opt: IMinioOpt) {
        assert(!MinioHelper.instance)
        winston.info(JSON.stringify(opt))
        assert(opt.secure === true || opt.secure === false)
        assert(opt.endPoint && opt.port && opt.accessKey && opt.secretKey)
        MinioHelper.instance = new MinioHelper(opt)
    }

    public static getInstance() {
        return MinioHelper.instance
    }
    public getClient() {
        return this.minioClient
    }

    public listBuckets() {
        return new Promise((resolve, reject) => {
            this.minioClient.listBuckets((err: Error, resp: any) => handleResult(resolve, reject, err, resp))
        })
    }

    public deleteBucket(bucket: string) {
        return new Promise((resolve, reject) => {
            this.minioClient.removeBucket(bucket, (err: Error) => handleResult(resolve, reject, err, 'true'))
        })
    }
    public bucketExists(bucket: string) {
        return new Promise((resolve, reject) => {
            this.minioClient.bucketExists(bucket, (err: any) => {
                if (err == null) return resolve(true)
                return resolve(false)
            })
        })
    }

    //创建目录
    public makeBucket(bucket: string) {
        return new Promise((resolve, reject) => {
            this.minioClient.makeBucket(bucket, 'us-east-1', (err: Error) => handleResult(resolve, reject, err, 'true'))
        })
    }

    //上传文件
    public uploadfile(bucket: string, filename: string, path: string) {
        return new Promise((resolve, reject) => {
            this.minioClient.fPutObject(bucket, filename, path, 'application/octet-stream', (err: any, etag: any) => {
                handleResult(resolve, reject, err, etag)
            })
        })
    }

    //获取文件列表
    public getfile(bucket: string, filename: string) {
        return new Promise((resolve, reject) => {
            this.minioClient.getObject(bucket, filename, (err: Error, stream: any) => handleResult(resolve, reject, err, stream))
        })
    }

    //设置bucket权限
    public setBucketPolicy(bucket: string, prefix: string) {
        return new Promise((resolve, reject) => {
            this.minioClient.setBucketPolicy(bucket, prefix, 'readonly', (err: Error) => handleResult(resolve, reject, err, true))
        })
    }

    //删除文件
    public deleteFile(bucket: string, fileName: string) {
        return new Promise((resolve, reject) => {
            this.minioClient.removeObject(bucket, fileName, (err: any) => {
                handleResult(resolve, reject, err, true)
            })
        })
    }
}
