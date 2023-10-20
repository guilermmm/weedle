import { NextApiRequest, NextApiResponse } from "next";
import { auth } from "../../server/auth";
import { prisma } from "../../server/db";
import { z } from "zod";

const updateSchema = z.object({
  score: z.number(),
});

const registerScore = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === "POST") {
    const session = await auth(req, res);
    if (!session || !session.user || !session.user.email) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) {
      res.status(401).json({ error: "User not found" });
      return;
    }
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { classicScore: user.classicScore + 1 },
    });

    res.status(200).json({ classicScore: updatedUser.classicScore });
  }

  if (req.method === "GET") {
    const classicScore = await prisma.user.findMany({
      select: { name: true, classicScore: true },
      orderBy: { classicScore: "desc" },
    });

    const journeyScore = await prisma.user.findMany({
      select: { name: true, journeyScore: true },
      orderBy: { journeyScore: "desc" },
    });

    res.status(200).json({ classicScore, journeyScore });
  }

  if (req.method === "PUT") {
    const session = await auth(req, res);
    if (!session || !session.user || !session.user.email) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) {
      res.status(401).json({ error: "User not found" });
      return;
    }

    try {
      const { score } = updateSchema.parse(req.body);

      if (score > user.journeyScore) {
        const updatedUser = await prisma.user.update({
          where: { id: user.id },
          data: { journeyScore: score },
        });

        res.status(200).json({ score: updatedUser.journeyScore });
      }
    } catch (e) {
      res.status(400).json({ error: "Invalid body" });
    }
  }
};

export default registerScore;
