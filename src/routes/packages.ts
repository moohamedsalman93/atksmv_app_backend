import express, {Request, Response} from 'express'
import { PrismaClient } from "@prisma/client";
import { fromZodError } from 'zod-validation-error';
import { annualPackageData, annualPackageEditData, annualPackageEditSchema, annualPackageSchema, monthPackageData, monthPackageEditData, monthPackageEditSchema, monthPackageSchema } from '../model/packages';

export const packageRouter = express.Router()

const prisma = new PrismaClient();

//Routes
packageRouter.put('/monthPackages', getMonthPackage)
packageRouter.post('/monthPackage', addMonthPackage)
packageRouter.put('/editMonthPackages', editMonthPackage)
packageRouter.delete('/monthPackages', deleteMonthPackage)

packageRouter.put('/annualPackages', getAnnualPackage)
packageRouter.post('/annualPackages', addAnnualPackage)
packageRouter.put('/editAnnualPackages', editAnnualhPackage)
packageRouter.delete('/annualPackages', deleteAnnualPackage)


packageRouter.put('/totalPackages', getUserPackage)
//user package
// async function getUserPackage(req:Request, res:Response) {
//   try{

//     const { userId } = req.body

//     if(!userId) {
//       return res.status(401).json({
//         msg: "userId is required"
//       })
//     }

//     const monpackages = await prisma.monthpackages.findMany({
//       orderBy: {
//         amount: 'asc'
//       },
//     })

//     const anlpackages = await prisma.anunualPackages.findMany({
//       orderBy: {
//         amount: 'asc'
//       },
//     })

//     const totalPackages = [monpackages, anlpackages]

//     let lastPack = await prisma.transaction.findFirst({
//       where: {
//         userId: userId,
//         status: "Success",
//       },
//       orderBy: {
//           id: 'desc'
//       },
//       select: {
//           packId: true,
//       }
//   });

//   return res.json({
//     totalPackages,
//     lastPack,
//   })


//   } catch(error) {
//     return res.json({
//       error: error
//     })
//   }
// }
async function getUserPackage(req: Request, res: Response) {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(401).json({
        msg: "userId is required",
      });
    }

    const monpackages = await prisma.monthpackages.findMany({
      orderBy: {
        amount: 'asc',
      },
    });

    const anlpackages = await prisma.anunualPackages.findMany({
      orderBy: {
        amount: 'asc',
      },
    });

    const addSno = (packages: any[], startingIndex: number) => {
      return packages.map((pkg, index) => ({
        sno: startingIndex + index + 1,
        ...pkg,
      }));
    };

    const totalPackages = [addSno(monpackages, 0), addSno(anlpackages, monpackages.length)];

    let lastPack = await prisma.transaction.findFirst({
      where: {
        userId: userId,
        status: "Success",
      },
      orderBy: {
        id: 'desc',
      },
      select: {
        packId: true,
      },
    });

    return res.json({
      totalPackages,
      lastPack,
    });
  } catch (error) {
    return res.json({
      error: error,
    });
  }
}


//#region
//Show packages
async function getMonthPackage(req: Request, res: Response) {
  try{
      
      const packages = await prisma.monthpackages.findMany({})

      const { userId } = req.body

        let lastPack = await prisma.transaction.findFirst({
            where: {
              userId: userId,
              status: "Success",
              packId: {
                contains: "MON"
              }
            },
            orderBy: {
                id: 'desc'
            },
            select: {
                packId: true,
            }
        });

      return res.status(200).json({
          packages: packages,
          lastPack: lastPack
      });

  } catch(error) {
      return res.status(400).json({
          err: "Internal Server Error",
          error: error
      });
  }
}
//#endregion

//#region
//create packages
async function addMonthPackage(req: Request, res: Response) {
  try {
    const data = monthPackageSchema.safeParse(req.body);

    if (!data.success) {
      let errMessage: string = fromZodError(data.error).message;
      return res.status(400).json({
        error: {
          message: errMessage,
        },
      });
    }

    const resultData: monthPackageData = data.data;

    if (!resultData) {
      return res.status(409).json({
        error: {
          message: "Invalid params",
        },
      });
    }

    // Retrieve the maximum current packageId
    const maxPackageId = await prisma.monthpackages.findFirst({
      select: {
        packId: true,
      },
      orderBy: {
        packId: 'desc',
      },
    });

    // Calculate the next packageId
    const nextPackageId = (maxPackageId?.packId ? parseInt(maxPackageId.packId.slice(3)) : 0) + 1;
    const formattedPackageId = `MON${nextPackageId}`;

    const packages = await prisma.monthpackages.create({
      data: {
        packId: formattedPackageId,
        amount: resultData.amount,
        years: resultData.years,
        returns: resultData.returns,
      },
    });

    if (!packages) {
      return res.status(401).json({
        err: "Internal Server Error",
      });
    }

    return res.json({
      packages: packages,
      msg: "New package Created successfully",
    });

  } catch (error) {
    return res.status(400).json({
      err: error,
    });
  }
}

//#endregion

//#region
//Edit the package
async function editMonthPackage(req: Request, res: Response) {
  try {
    const { packId, ...updateFields } = req.body;

    if (!packId) {
      return res.json({ msg: "packId is required" });
    }

    const data = monthPackageEditSchema.safeParse(req.body);

    if (!data.success) {
      let errMessage: string = fromZodError(data.error).message;
      return res.status(400).json({
        error: {
          message: errMessage,
        },
      });
    }

    const resultData: monthPackageEditData = data.data;

    if (!resultData) {
      return res.status(409).json({
        error: {
          message: "Invalid params",
        },
      });
    }

    if (Object.keys(updateFields).length === 0) {
      return res.status(200).json({
        msg: "No updates provided",
      });
    }

    const updateData: Record<string, any> = {};

    if ('amount' in updateFields) {
      updateData.amount = resultData.amount;
    }
    
    if ('years' in updateFields) {
      updateData.years = resultData.years;
    }
    
    if ('returns' in updateFields) {
      updateData.returns = resultData.returns;
    }


    const packages = await prisma.monthpackages.update({
      where: {
        packId: packId,
      },
      data: updateData,
    });

    return res.status(200).json({
      msg: "packages Updated successfully",
    });
  } catch (error) {
    console.log(error)
    return res.status(400).json({
      error: error,
    });
  }
}
//#endregion

//#region
//delete the package
async function deleteMonthPackage(req: Request, res: Response) {
    try {
        const { packId } = req.query;

        if (!packId) {
            return res.json({
                msg: "packId is required"
            });
        }

        const deleteMonthPackage = await prisma.monthpackages.delete({
            where: {
                packId: packId as string
            }
        });

        return res.status(200).json({
            msg: "Package deleted successfully"
        });
    } catch (err) {
        return res.status(400).json({
            error: err
        });
    }
}
//#endregion

//#region
//Show annual packages
async function getAnnualPackage(req: Request, res: Response) {
  try{
      
      const packages = await prisma.anunualPackages.findMany({})

      const { userId } = req.body


        let lastPack = await prisma.transaction.findFirst({
            where: {
              userId: userId,
              status: "Success",
              packId: {
                contains: "ANL"
              }
            },
            orderBy: {
                id: 'desc'
            },
            select: {
                packId: true,
            }
        });

      return res.status(200).json({
          packages: packages,
          lastPack: lastPack
      });

  } catch(error) {
      return res.status(400).json({
          err: "Internal Server Error",
          error: error
      });
  }
}
//#endregion

//#region
//create packages
async function addAnnualPackage(req: Request, res: Response) {
    try{
        const data = annualPackageSchema.safeParse(req.body);
  
        if (!data.success) {
          let errMessage: string = fromZodError(data.error).message;
          return res.status(400).json({
            error: {
              message: errMessage,
            },
          });
        }
    
        const resultData: annualPackageData = data.data;
    
        if (!resultData) {
          return res.status(409).json({
            error: {
              message: "Invalid params",
            },
          });
        }

         // Retrieve the maximum current packageId
        const maxPackageId = await prisma.anunualPackages.findFirst({
          select: {
            packId: true,
          },
          orderBy: {
            packId: 'desc',
          },
        });

    // Calculate the next packageId
    const nextPackageId = (maxPackageId?.packId ? parseInt(maxPackageId.packId.slice(3)) : 10) + 1;
    const formattedPackageId = `ANL${nextPackageId}`;
          
        const packages = await prisma.anunualPackages.create({
            data: {
              packId: formattedPackageId,
                amount: resultData.amount,
                years: resultData.years,
                returns: resultData.returns,
            }
        })

        if(!packages) {
            return res.status(401).json({
                err: "Internal Server Error"
            })
        };

        return res.json({
            packages: packages,
            msg: "New package Created succesfully"
        });
        
    } catch(error) {
        return res.status(400).json({
            err: error
        })
    }
}
//#endregion

//#region
//Edit the package
async function editAnnualhPackage(req: Request, res: Response) {
  try {
    const { packId, ...updateFields } = req.body;

    if (!packId) {
      return res.status(400).json({ msg: "packId is required" });
    }

    const data = annualPackageEditSchema.safeParse(req.body);

    if (!data.success) {
      const errMessage = fromZodError(data.error).message;
      return res.status(400).json({
        error: {
          message: errMessage,
        },
      });
    }

    const resultData: annualPackageEditData = data.data;

    if (!resultData) {
      return res.status(409).json({
        error: {
          message: "Invalid params",
        },
      });
    }

    const updateData: Record<string, any> = {};

    if ('amount' in updateFields && typeof resultData.amount === 'number') {
      updateData.amount = resultData.amount;
    }

    if ('years' in updateFields && typeof resultData.years === 'number') {
      updateData.years = resultData.years;
    }

    if ('returns' in updateFields && typeof resultData.returns === 'number') {
      updateData.returns = resultData.returns;
    }

    if (Object.keys(updateData).length === 0) {
      return res.status(200).json({
        msg: "No updates provided",
      });
    }

    await prisma.anunualPackages.update({
      where: {
        packId: packId,
      },
      data: updateData,
    });

    return res.status(200).json({
      msg: "Package updated successfully",
    });

  } catch (error) {
    console.log(error)
    return res.status(400).json({
      error: error,
    });
  }
}
//#endregion

//#region
//delete the package
async function deleteAnnualPackage(req: Request, res: Response) {
    try {
        const { packId } = req.query;

        if (!packId) {
            return res.json({
                msg: "packId is required"
            });
        }

        const deleteMonthPackage = await prisma.anunualPackages.delete({
            where: {
                packId: packId as string
            }
        });

        return res.status(200).json({
            msg: "Package deleted successfully"
        });
    } catch (err) {
        return res.status(400).json({
            error: err
        });
    }
}
//#endregion
