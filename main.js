import javax.crypto.Cipher;
import javax.crypto.KeyGenerator;
import javax.crypto.SecretKey;
import javax.crypto.spec.IvParameterSpec;
import java.util.Base64;
import java.security.SecureRandom;
public class AESProtection {
    private static final String ALGORITHM = "AES/CBC/PKCS5Padding";
    public static void main(String[] args) 
    throws Exception { SecretKey secretKey = generateKey();
    byte[] iv = generateIV();  
    String originalText = "Sensitive Web Data";                  
    String encryptedText = encrypt(originalText, secretKey, iv);                  
    String decryptedText = decrypt(encryptedText, secretKey, iv);                  
    System.out.println("Original: " + originalText);                  
    System.out.println("Encrypted: " + encryptedText);                  
    System.out.println("Decrypted: " + decryptedText); 
}
// Generate AES Key (256-bit)
public static SecretKey generateKey() throws Exception {
    KeyGenerator keyGen = KeyGenerator.getInstance("AES");
    keyGen.init(256);
    return keyGen.generateKey(); 
}
// Generate a random IV (16 bytes)
public static byte[] generateIV() {
    byte[] iv = new byte[16];
    new SecureRandom().nextBytes(iv);
    return iv; 
}
// Encrypt data
public static String encrypt(String data, SecretKey key, byte[] iv) throws Exception {
    Cipher cipher = Cipher.getInstance(ALGORITHM);
    cipher.init(Cipher.ENCRYPT_MODE, key, new IvParameterSpec(iv));
    byte[] encrypted = cipher.doFinal(data.getBytes());
    return Base64.getEncoder().encodeToString(encrypted); 
}
// Decrypt data
public static String decrypt(String encryptedData, SecretKey key, byte[] iv) throws Exception {
    Cipher cipher = Cipher.getInstance(ALGORITHM);
    cipher.init(Cipher.DECRYPT_MODE, key, new IvParameterSpec(iv));
    byte[] decrypted = cipher.doFinal(Base64.getDecoder().decode(encryptedData));
    return new String(decrypted); } 
}




// Hambuurger
const hamburger = document.querySelector(".hamburger");
const navMenu = document.querySelector(".nav-menu");

hamburger.addEventListener("click", mobileMenu);

function mobileMenu() {
hamburger.classList.toggle("active");
navMenu.classList.toggle("active");
}
const navLink = document.querySelectorAll(".nav-link");

navLink.forEach(n => n.addEventListener("click", closeMenu));

function closeMenu() {
hamburger.classList.remove("active");
navMenu.classList.remove("active");
}
// GOTO TOP BUTTON
var scrollToTopBtn = document.getElementById("scrollToTopBtn");
var rootElement = document.documentElement;
scrollToTopBtn.addEventListener("click", scrollToTop);
function scrollToTop() {
  // Scroll to top logic
  rootElement.scrollTo({
    top: 0,
    behavior: "smooth"
  });
