<div className="input-group mb-3">
  <div className="input-group-prepend">
    <label className="input-group-text" htmlFor="inputGroupSelect01">
      # cards
    </label>
  </div>
  <div className="btn-group btn-group-toggle" data-toggle="buttons">
    <NumSearchButton
      value="5"
      currentNumSearch={formData.numsearch}
      handleInputChange={handleInputChange}
    />
    <NumSearchButton
      value="10"
      currentNumSearch={formData.numsearch}
      handleInputChange={handleInputChange}
    />
    <NumSearchButton
      value="15"
      currentNumSearch={formData.numsearch}
      handleInputChange={handleInputChange}
    />
    <NumSearchButton
      value="20"
      currentNumSearch={formData.numsearch}
      handleInputChange={handleInputChange}
    />
  </div>
</div>;
