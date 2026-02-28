import com.hospomate.service.SquareService;
import org.springframework.boot.SpringApplication;
import org.springframework.context.ApplicationContext;
import com.hospomate.HospoMateApplication;

public class TestCategories {
    public static void main(String[] args) {
        ApplicationContext ctx = SpringApplication.run(HospoMateApplication.class, args);
        SquareService squareService = ctx.getBean(SquareService.class);
        System.out.println("TESTING CATEGORIES:");
        System.out.println(squareService.fetchSquareCategoryNames());
        System.exit(0);
    }
}
