import { NextRequest, NextResponse } from "next/server";
import { generateSyntheseDocx } from "@/lib/generate-docx";
import type { CandidateData } from "@/lib/generate-docx";

export async function POST(request: NextRequest) {
  try {
    const data: CandidateData = await request.json();

    const buffer = await generateSyntheseDocx(data);

    const filename = `Synthese_${data.nom.replace(/\s+/g, "_")}_${new Date().toISOString().slice(0, 10)}.docx`;

    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error("Erreur génération synthèse:", error);
    return NextResponse.json(
      { error: "Erreur lors de la génération du document" },
      { status: 500 }
    );
  }
}
