use anyhow::Result as AnyhowResult;
use libvips::{
    VipsImage,
    ops::{
        ForeignKeep as VipsForeignKeep, ThumbnailImageOptions as VipsThumbnailImageOptions,
        WebpsaveBufferOptions as VipsWebpsaveBufferOptions,
        thumbnail_image_with_opts as vips_thumbnail_image_with_opts,
        webpsave_buffer_with_opts as vips_webpsave_buffer_with_opts,
    },
};
use tokio::{
    runtime::Handle,
    sync::mpsc::{self, Receiver, Sender, error::SendError},
};

use crate::{R2Bucket, schemas::enums::FileType};

// TODO: maybe make a cache
#[derive(Clone, Debug)]
pub struct Thumbnailer(Sender<(String, FileType)>);

impl Thumbnailer {
    #[must_use]
    pub fn new() -> (Self, Receiver<(String, FileType)>) {
        let (tx, rx) = mpsc::channel(10); // Totally an arbitrary number
        (Self(tx), rx)
    }

    pub async fn signal_for_processing(
        &self,
        object_key: String,
        filetype: FileType,
    ) -> Result<(), SendError<(String, FileType)>> {
        self.0.send((object_key, filetype)).await
    }

    pub(crate) fn process_single_thumbnail(
        handle: &Handle,
        bucket: &R2Bucket,
        object_key: &str,
        filetype: FileType,
    ) -> AnyhowResult<()> {
        let buffer =
            handle.block_on(bucket.get_file_for_thumbnail_processing(object_key, filetype))?;
        let vips_image = VipsImage::new_from_buffer(&buffer, "")?;
        let vips_image_thumbnail = vips_thumbnail_image_with_opts(
            &vips_image,
            64,
            &VipsThumbnailImageOptions {
                height: 64,
                import_profile: String::from("sRGB"),
                export_profile: String::from("sRGB"),
                ..Default::default()
            },
        )?;

        let thumbnail_buffer = vips_webpsave_buffer_with_opts(
            &vips_image_thumbnail,
            &VipsWebpsaveBufferOptions {
                effort: 6,
                mixed: true,
                keep: VipsForeignKeep::None,
                profile: String::from("none"),
                ..Default::default()
            },
        )?;
        handle.block_on(bucket.put_thumbnail(&thumbnail_buffer, object_key))?;

        Ok(())
    }
}
