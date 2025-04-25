let images = document.querySelectorAll("landingContent");
lazyload(images);

public class ImageUtil 
{

    private static RenderingHints hints;

    static 
    {
        hints = new RenderingHints(RenderingHints.KEY_INTERPOLATION, RenderingHints.VALUE_INTERPOLATION_BICUBIC);
        hints.put(RenderingHints.KEY_COLOR_RENDERING,RenderingHints.VALUE_COLOR_RENDER_QUALITY);
        hints.put(RenderingHints.KEY_RENDERING, RenderingHints.VALUE_RENDER_QUALITY);

        /*
         * this block is to silence the warning that we're not using JAI
         * native acceleration but are using the pure java implementation.
         */
        Properties p = new Properties(System.getProperties());
        p.put("com.sun.media.jai.disableMediaLib", "true");
        System.setProperties(p);
    }  


    public static byte[] getScaledInstance(byte[] image, int maxWidth) 
    {
        InputStream in = new ByteArrayInputStream(image);
        BufferedImage img = null;
        try 
        {
            img = ImageIO.read(in);

        double scale = (double) maxWidth / img.getWidth();
        if ( scale > 1.0d ) 
        {
                //return getByteArray(getScaledUpGraphics(img, scale));
            return image;
        } 
        else if (scale > 0.5d && scale < 1.0d) 
        {
                return getByteArray(getScaledDownByGraphics(img, scale));
        } 
        else if (scale <= 0.5d) 
        {
                return getByteArray(getScaledDownByJAI(img, scale));
        }
        // else scale == 1.0d; no change required.
        } 
        catch (IOException e) 
        {
            e.printStackTrace();
        }
        return image;
    }

    public static byte[] getByteArray(BufferedImage img)
    {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        byte[] imageInByte = null;
        try 
        {
            ImageIO.write( img, "jpg", baos );
            baos.flush();
            imageInByte = baos.toByteArray();
            baos.close();
        } 
        catch (IOException e) 
        {
            e.printStackTrace();
        }

        return imageInByte;
    }

    /**
     * See http://www.digitalsanctuary.com/tech-blog/java/how-to-resize-uploaded-images-using-java-better-way.html
     * This instance seems to produce quality images ONLY when you are
     * scaling down to something less than 50% of the original size.
     * @param img
     * @param scale
     * @return the scaled image
     */
    private static BufferedImage getScaledDownByJAI(BufferedImage img, double scale) 
    {
        if(scale > 1.0d) {
                throw new RuntimeException("Can't scale according to " + scale + " : This method only scales down.");
        }
        PlanarImage originalImage = PlanarImage.wrapRenderedImage(img);
        // now resize the image
        ParameterBlock paramBlock = new ParameterBlock();
        paramBlock.addSource(originalImage); // The source image
        paramBlock.add(scale); // The xScale
        paramBlock.add(scale); // The yScale
        paramBlock.add(0.0); // The x translation
        paramBlock.add(0.0); // The y translation
        RenderedOp resizedImage = JAI.create("SubsampleAverage", paramBlock, hints);
        return resizedImage.getAsBufferedImage();      
    }

    /**
     * This method produces high quality images when target scale is greater
     * than 50% of the original.
     * @param img
     * @param scale
     * @return the scaled image
     */
    private static BufferedImage getScaledDownByGraphics(BufferedImage img, double scale) 
    {
        final float scaleFactor = 0.8f;
        BufferedImage ret = (BufferedImage)img;
        int w = img.getWidth();
        int h = img.getHeight();

        int targetWidth = (int)(img.getWidth() * scale);
        int targetHeight = (int)(img.getHeight() * scale);

        int loopCount = 0;
        int maxLoopCount = 20;
        BufferedImage tmp;
        do 
        {
            if (w > targetWidth) {
                    w *= scaleFactor;
                    if (w < targetWidth) {
                            w = targetWidth;
                    }
            }
            if (h > targetHeight) {
                    h *= scaleFactor;
                    if (h < targetHeight) {
                            h = targetHeight;
                    }
            }
            tmp = new BufferedImage(w, h, BufferedImage.TYPE_INT_RGB);
            Graphics2D g2 = tmp.createGraphics();

            g2.addRenderingHints(hints);
            g2.drawImage(ret, 0, 0, w, h, null);
            g2.dispose();

            ret = tmp;
            if(++loopCount > maxLoopCount) {
                    throw new RuntimeException("Hit maximum loop count " + maxLoopCount);
            }
        } while (w != targetWidth || h != targetHeight);
        return ret;    
    }
}
