let images = document.querySelectorAll("landingContent");
lazyload(images);

import java.awt.Graphics2D;
import java.awt.Image;
import java.awt.image.BufferedImage;
import java.io.File;
import java.io.IOException;
import javax.imageio.ImageIO;

public class ImageResizer {
    public static void main(String[] args) {
        try {
            File inputFile = new File("img/");
            BufferedImage inputImage = ImageIO.read(inputFile);

            int scaledWidth = 800; // desired width
            int scaledHeight = 600; // desired height

            BufferedImage outputImage = new BufferedImage(scaledWidth, scaledHeight, inputImage.getType());
            Graphics2D g2d = outputImage.createGraphics();
            g2d.drawImage(inputImage, 0, 0, scaledWidth, scaledHeight, null);
            g2d.dispose();

            File outputFile = new File("img/");
            ImageIO.write(outputImage, "jpg", outputFile);

            System.out.println("Image resized successfully!");
        } catch (IOException e) {
            System.err.println("Error resizing the image: " + e.getMessage());
        }
    }
}
