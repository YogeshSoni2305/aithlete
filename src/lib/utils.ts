import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { GeneratedPlan } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

import jsPDF from "jspdf";

// Helper to add watermark
const addWatermark = (doc: jsPDF, pageWidth: number, pageHeight: number) => {
  doc.saveGraphicsState();
  doc.setTextColor(230, 230, 230); // Very light gray
  doc.setFontSize(60);
  doc.setFont("helvetica", "bold");
  // Rotate context to 45 degrees
  doc.text("AIthlete", pageWidth / 2, pageHeight / 2, { align: "center", angle: 45 });
  doc.restoreGraphicsState();
};

// Helper for section header
const addSectionHeader = (doc: jsPDF, title: string, y: number, pageWidth: number) => {
  doc.setFillColor(124, 58, 237); // Purple-600
  doc.rect(0, y, pageWidth, 12, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text(title, 20, y + 8);
  doc.setTextColor(0, 0, 0); // Reset to black
  return y + 20;
};

export async function exportToPDF(plan: GeneratedPlan, fileName: string) {
  try {
    console.log("Starting detailed PDF export...");

    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    let yPosition = 20;
    const pageWidth = 210;
    const pageHeight = 297;
    const margin = 20;
    const contentWidth = pageWidth - (2 * margin);

    // Helper function to check if we need a new page
    const checkPageBreak = (requiredSpace: number) => {
      if (yPosition + requiredSpace > pageHeight - 20) {
        pdf.addPage();
        addWatermark(pdf, pageWidth, pageHeight);
        yPosition = 20;
        return true;
      }
      return false;
    };

    // Initialize First Page
    addWatermark(pdf, pageWidth, pageHeight);

    // Title Section
    pdf.setFillColor(245, 243, 255); // Light purple bg
    pdf.rect(0, 0, pageWidth, 50, "F");

    pdf.setFontSize(32);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(124, 58, 237); // Purple text
    pdf.text("AIthlete", margin, 32);

    pdf.setFontSize(12);
    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(107, 114, 128); // Gray text
    pdf.text("Your Personalized Transformation Plan", margin, 42);

    yPosition = 65;

    // Workout Plan Section
    yPosition = addSectionHeader(pdf, "Workout Plan", yPosition, pageWidth);

    plan.workoutPlan.forEach((day, index) => {
      checkPageBreak(50);

      // Day header card
      pdf.setFillColor(249, 250, 251); // Gray-50
      pdf.setDrawColor(229, 231, 235); // Gray-200
      pdf.roundedRect(margin, yPosition, contentWidth, 10, 2, 2, "FD");

      pdf.setFontSize(12);
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(0, 0, 0);
      pdf.text(`${day.day}: ${day.focus}`, margin + 5, yPosition + 7);
      yPosition += 18;

      // Exercises
      day.exercises.forEach((exercise, exIndex) => {
        checkPageBreak(25);

        // Exercise Name
        pdf.setFontSize(11);
        pdf.setFont("helvetica", "bold");
        pdf.setTextColor(31, 41, 55); // Gray-800
        pdf.text(`${exIndex + 1}. ${exercise.name}`, margin + 5, yPosition);
        yPosition += 5;

        // Details line
        pdf.setFontSize(10);
        pdf.setFont("helvetica", "normal");
        pdf.setTextColor(75, 85, 99); // Gray-600
        const details = `Sets: ${exercise.sets}  •  Reps: ${exercise.reps}  •  Rest: ${exercise.rest}`;
        pdf.text(details, margin + 5, yPosition);
        yPosition += 5;

        // Notes
        if (exercise.notes) {
          pdf.setFontSize(9);
          pdf.setFont("helvetica", "italic");
          pdf.setTextColor(107, 114, 128); // Gray-500
          const notePrefix = "Tip: ";
          const noteWidth = contentWidth - 10;
          const lines = pdf.splitTextToSize(`${notePrefix}${exercise.notes}`, noteWidth);
          pdf.text(lines, margin + 5, yPosition);
          yPosition += (lines.length * 4);
        }

        yPosition += 4; // Spacing between exercises
      });

      yPosition += 5; // Spacing between days
    });

    // Diet Plan Section
    checkPageBreak(30);
    yPosition += 10;
    yPosition = addSectionHeader(pdf, "Diet Plan", yPosition, pageWidth);

    plan.dietPlan.forEach((day, index) => {
      checkPageBreak(70);

      // Day header
      pdf.setFontSize(14);
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(124, 58, 237); // Purple
      pdf.text(day.day, margin, yPosition);
      // Underline
      pdf.setDrawColor(124, 58, 237);
      pdf.line(margin, yPosition + 2, margin + 30, yPosition + 2);
      yPosition += 10;

      const meals = [
        { title: "Breakfast", data: day.breakfast, color: [239, 68, 68] }, // Red
        { title: "Lunch", data: day.lunch, color: [34, 197, 94] },         // Green
        { title: "Dinner", data: day.dinner, color: [59, 130, 246] },      // Blue
      ];

      meals.forEach(meal => {
        checkPageBreak(30);
        pdf.setFontSize(11);
        pdf.setFont("helvetica", "bold");
        pdf.setTextColor(meal.color[0], meal.color[1], meal.color[2]);
        pdf.text(meal.title, margin, yPosition);

        pdf.setTextColor(0, 0, 0);
        pdf.setFont("helvetica", "bold");
        pdf.text(meal.data.name, margin + 25, yPosition);
        yPosition += 5;

        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(10);
        pdf.setTextColor(55, 65, 81);
        const descLines = pdf.splitTextToSize(meal.data.description, contentWidth - 25);
        pdf.text(descLines, margin + 25, yPosition);
        yPosition += (descLines.length * 4) + 1;

        // Macros
        pdf.setFontSize(9);
        pdf.setTextColor(107, 114, 128);
        const macros = `${meal.data.calories} kcal  |  P: ${meal.data.protein}g  |  C: ${meal.data.carbs}g  |  F: ${meal.data.fats}g`;
        pdf.text(macros, margin + 25, yPosition);
        yPosition += 6;
      });

      // Snacks
      if (day.snacks && day.snacks.length > 0) {
        checkPageBreak(20);
        pdf.setFontSize(11);
        pdf.setFont("helvetica", "bold");
        pdf.setTextColor(245, 158, 11); // Amber
        pdf.text("Snacks", margin, yPosition);

        day.snacks.forEach(snack => {
          checkPageBreak(15);
          pdf.setTextColor(0, 0, 0);
          pdf.setFontSize(10);
          pdf.setFont("helvetica", "normal");
          pdf.text(`• ${snack.name}`, margin + 25, yPosition);
          yPosition += 4;

          pdf.setFontSize(9);
          pdf.setTextColor(107, 114, 128);
          pdf.text(`${snack.calories} kcal`, margin + 25, yPosition);
          yPosition += 4;
        });
        yPosition += 2;
      }
      yPosition += 8;
    });

    // Tips Section
    if (plan.tips && plan.tips.length > 0) {
      checkPageBreak(40);
      yPosition += 10;
      yPosition = addSectionHeader(pdf, "Expert Tips", yPosition, pageWidth);

      pdf.setFontSize(10);
      pdf.setFont("helvetica", "normal");
      pdf.setTextColor(0, 0, 0);

      plan.tips.forEach(tip => {
        checkPageBreak(10);
        // Bullet point
        pdf.setFillColor(124, 58, 237);
        pdf.circle(margin + 2, yPosition - 1, 1, "F");

        const lines = pdf.splitTextToSize(tip, contentWidth - 10);
        pdf.text(lines, margin + 8, yPosition);
        yPosition += (lines.length * 5) + 3;
      });
    }

    // Motivation Quote
    if (plan.motivation) {
      checkPageBreak(40);
      yPosition += 20;

      pdf.setDrawColor(229, 231, 235);
      pdf.setLineWidth(1);
      pdf.line(margin + 40, yPosition, pageWidth - margin - 40, yPosition);
      yPosition += 10;

      pdf.setFontSize(14);
      pdf.setFont("helvetica", "italic");
      pdf.setTextColor(75, 85, 99);
      const quoteText = `"${plan.motivation}"`;
      const quoteLines = pdf.splitTextToSize(quoteText, contentWidth - 40);

      quoteLines.forEach((line: string) => {
        pdf.text(line, pageWidth / 2, yPosition, { align: "center" });
        yPosition += 6;
      });
    }

    // Footer
    const totalPages = (pdf as any).internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      pdf.setPage(i);
      pdf.setFontSize(8);
      pdf.setFont("helvetica", "normal");
      pdf.setTextColor(156, 163, 175);
      pdf.text(`AIthlete • Generated on ${new Date().toLocaleDateString()}`, margin, pageHeight - 10);
      pdf.text(`Page ${i} of ${totalPages}`, pageWidth - margin, pageHeight - 10, { align: "right" });
    }

    console.log("Saving PDF...");
    pdf.save(`${fileName}.pdf`);
    console.log("PDF saved successfully!");

  } catch (error) {
    console.error("Error generating PDF:", error);
    alert(`Failed to generate PDF: ${error instanceof Error ? error.message : 'Unknown error'}. Please check the console for details.`);
  }
}
