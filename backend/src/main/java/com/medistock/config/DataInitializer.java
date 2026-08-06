package com.medistock.config;

import com.medistock.entity.Category;
import com.medistock.entity.Medicine;
import com.medistock.repository.CategoryRepository;
import com.medistock.repository.MedicineRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.*;

@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    private final CategoryRepository categoryRepository;
    private final MedicineRepository medicineRepository;

    public DataInitializer(CategoryRepository categoryRepository, MedicineRepository medicineRepository) {
        this.categoryRepository = categoryRepository;
        this.medicineRepository = medicineRepository;
    }

    @Override
    public void run(String... args) throws Exception {
        log.info("Initializing medicine categories data...");

        Map<String, Category> categoryMap = new HashMap<>();

        // Standard medical categories
        List<String[]> defaultCategories = Arrays.asList(
            new String[]{"Analgesics & Pain Relief", "Pain relievers, NSAIDs, and antipyretic formulations"},
            new String[]{"Antibiotics & Antimicrobials", "Broad-spectrum antibiotics and antibacterial medications"},
            new String[]{"Cardiovascular & Heart Care", "Blood pressure regulation, statins, and cardiac health"},
            new String[]{"Antidiabetics & Endocrine", "Insulin therapies, blood glucose regulators, and metabolic care"},
            new String[]{"Vitamins & Supplements", "Essential vitamins, mineral supplements, and immune boosters"},
            new String[]{"Respiratory & Allergy", "Antihistamines, bronchodilators, and decongestants"},
            new String[]{"Dermatological & Topical", "Topical ointments, skin treatments, and antiseptic creams"},
            new String[]{"Gastrointestinal & Digestive", "Antacids, proton pump inhibitors, and digestive health"}
        );

        for (String[] catData : defaultCategories) {
            String name = catData[0];
            String desc = catData[1];
            Category cat = categoryRepository.findByNameIgnoreCase(name).orElseGet(() -> {
                log.info("Creating category: {}", name);
                return categoryRepository.save(new Category(name, desc));
            });
            categoryMap.put(name.toLowerCase(), cat);
        }

        // Associate existing medicines with categories if currently unassigned
        List<Medicine> medicines = medicineRepository.findAll();
        for (Medicine med : medicines) {
            if (med.getCategory() == null) {
                String nameLower = med.getName().toLowerCase();
                Category assignedCat = null;

                if (nameLower.contains("para") || nameLower.contains("ibu") || nameLower.contains("asp") || nameLower.contains("pain") || nameLower.contains("crocin") || nameLower.contains("dolo")) {
                    assignedCat = categoryMap.get("analgesics & pain relief");
                } else if (nameLower.contains("mox") || nameLower.contains("cin") || nameLower.contains("biotic") || nameLower.contains("zithro") || nameLower.contains("penicillin")) {
                    assignedCat = categoryMap.get("antibiotics & antimicrobials");
                } else if (nameLower.contains("statin") || nameLower.contains("dipine") || nameLower.contains("pril") || nameLower.contains("heart")) {
                    assignedCat = categoryMap.get("cardiovascular & heart care");
                } else if (nameLower.contains("formic") || nameLower.contains("form") || nameLower.contains("insu") || nameLower.contains("glip")) {
                    assignedCat = categoryMap.get("antidiabetics & endocrine");
                } else if (nameLower.contains("vit") || nameLower.contains("calcium") || nameLower.contains("zinc") || nameLower.contains("supp")) {
                    assignedCat = categoryMap.get("vitamins & supplements");
                } else if (nameLower.contains("cetri") || nameLower.contains("lora") || nameLower.contains("cough") || nameLower.contains("cold")) {
                    assignedCat = categoryMap.get("respiratory & allergy");
                } else if (nameLower.contains("prazol") || nameLower.contains("gastro") || nameLower.contains("gel")) {
                    assignedCat = categoryMap.get("gastrointestinal & digestive");
                } else {
                    // Fallback to first available category
                    assignedCat = categoryMap.values().iterator().next();
                }

                if (assignedCat != null) {
                    med.setCategory(assignedCat);
                    medicineRepository.save(med);
                    log.info("Assigned medicine '{}' to category '{}'", med.getName(), assignedCat.getName());
                }
            }
        }
    }
}
