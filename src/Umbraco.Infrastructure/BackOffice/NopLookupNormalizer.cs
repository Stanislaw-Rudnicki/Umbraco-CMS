﻿using Microsoft.AspNetCore.Identity;

namespace Umbraco.Core.BackOffice
{
    /// <summary>
    /// No-op lookup normalizer to maintain compatibility with ASP.NET Identity 2
    /// </summary>
    public class NopLookupNormalizer : ILookupNormalizer
    {
        public string NormalizeName(string name) => name;

        public string NormalizeEmail(string email) => email;
    }
}