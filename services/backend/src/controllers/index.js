const uploadBarcode = async (req, res) => {
  try {
    if (req.files != null && req.files.barcode != null) {
      const filename = jobId + "." + req.files.barcode.name.split(".").pop();
      const filepath = "./uploads/barcode/" + filename;
      await req.files.barcode.mv(filepath);
      return res.status(200).json({ jobId: uuidv4() });
    }
    return res.status(400).json({
      message: "file missing",
    });
  } catch (error) {
    return res.status(400).json({
      message: "upload error",
    });
  }
};

module.exports = { uploadBarcode };
