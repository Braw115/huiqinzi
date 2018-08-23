
import { validateCgi } from "../../lib/validator"
import { fileValidator } from "./validator"
import { RouterWrap } from "../../lib/routerwrap"
import { MinioHelper } from "../../lib/miniohelper"
import { unlink } from 'fs'

/**
 * 上传图片接口
   fileType:['goods', 'activity', 'logo', 'banner']
            商品       活动      店铺图标     轮播
 */
export const router = new RouterWrap({ prefix: "/uploads" })


router.loginHandle("post", "/pics", async (ctx, next) => {
    const { fileType } = (ctx.req as any).body
    let files = (ctx.req as any).files
    validateCgi({ fileType }, fileValidator.type)

    let urlArray = new Array
    if (files.length > 0) {
        for (let file of files) {
            let types = file.originalname.split('.')
            let type = types.pop()
            let fileName = file.filename + '.' + type
            await MinioHelper.getInstance().uploadfile(fileType, fileName, file.path)
            let url = `${fileType}/${fileName}`
            urlArray.push(url)
            unlink(file.path, (err) => {
                if (err) console.log(err)
            })
        }
    }
    ctx.body = urlArray
})

// 删除服务器的的图片
router.handle("delete", "/pic", async (ctx, next) => {
    const { url } = (ctx.request as any).body
    let Arr = url.split('/')
    let bucketName = Arr[0]
    Arr.splice(0, 1)
    let fileName = Arr.join('/')
    await MinioHelper.getInstance().deleteFile(bucketName, fileName)
    ctx.body = { msg: "deleted ok!" }
})

export async function deletePic(url: string) {
    let Arr = url.split('/')
    let bucketName = Arr[0]
    Arr.splice(0, 1)
    let fileName = Arr.join('/')
    await MinioHelper.getInstance().deleteFile(bucketName, fileName)
}